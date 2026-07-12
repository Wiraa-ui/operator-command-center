import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Chat proxy: browser -> this server fn (same-origin) -> n8n webhook.
//
// Why proxy instead of calling n8n directly from the browser:
//   - n8n webhook stays private (no CORS, not advertised to clients)
//   - we reach n8n over 127.0.0.1:5678 — internal, bypassing the Cloudflare
//     Tunnel relay overhead
//   - LLM API keys live only in n8n, never in the browser
//   - portfolio data (context) is assembled server-side from src/content
//
// Non-streaming by design: the n8n workflow responds once with the full reply.

const MAX_MESSAGE = 1000;

const messageSchema = z.object({
  message: z.string().trim().min(1).max(MAX_MESSAGE),
  // Conversation memory is authoritative on the n8n side, keyed by this id
  // (the browser persists it in localStorage). The server stays stateless.
  sessionId: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[A-Za-z0-9_-]+$/)
    .default("anon"),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator(messageSchema)
  .handler(async ({ data }) => {
    // Server-only import kept inside the handler so it's tree-shaken from the
    // client bundle.
    const { buildAssistantContext } = await import("./assistant.context.server");

    const webhookUrl =
      process.env.N8N_CHAT_WEBHOOK_URL ?? "http://127.0.0.1:5678/webhook/portfolio-chat";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: data.message,
          sessionId: data.sessionId,
          context: buildAssistantContext(),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        return {
          reply:
            "The assistant is offline right now. Reach me directly on WhatsApp or email from the Contact page.",
          ok: false as const,
        };
      }

      const payload = (await res.json()) as { reply?: string } | { reply?: string }[];
      const obj = Array.isArray(payload) ? payload[0] : payload;
      const reply = obj?.reply?.trim();

      return {
        reply:
          reply && reply.length > 0
            ? reply
            : "I didn't catch that — could you rephrase your question?",
        ok: true as const,
      };
    } catch {
      return {
        reply:
          "The assistant is offline right now. Reach me directly on WhatsApp or email from the Contact page.",
        ok: false as const,
      };
    } finally {
      clearTimeout(timeout);
    }
  });
