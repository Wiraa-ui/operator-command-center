import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Send, Loader2, RotateCcw } from "lucide-react";
import { askAssistant } from "@/lib/api/assistant.functions";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi — I'm Operator, the assistant for this portfolio. Ask me about Wira's projects, his stack, or how to work with him.";

const SESSION_KEY = "portfolio-chat-session";
const TRANSCRIPT_KEY = "portfolio-chat-transcript";

// Stable per-visitor id, persisted so the server-side memory recognises a
// returning visitor across page reloads. Created lazily on the client only.
function getSessionId(): string {
  if (typeof window === "undefined") return "anon";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `s-${Date.now()}-${Math.random().toString(36).slice(2)}`)
        .replace(/[^A-Za-z0-9_-]/g, "")
        .slice(0, 80);
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const sessionRef = useRef<string>("anon");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore session id + visible transcript on the client (post-hydration to
  // avoid SSR mismatch).
  useEffect(() => {
    sessionRef.current = getSessionId();
    try {
      const saved = window.localStorage.getItem(TRANSCRIPT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Msg[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Persist the visible transcript (capped) so a refresh keeps the conversation.
  useEffect(() => {
    try {
      window.localStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* quota / unavailable — non-fatal */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function resetChat() {
    try {
      window.localStorage.removeItem(TRANSCRIPT_KEY);
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    sessionRef.current = getSessionId(); // fresh id => server starts a new memory
    setMessages([{ role: "assistant", content: GREETING }]);
  }

  async function send() {
    const text = input.trim();
    if (!text || pending) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);

    try {
      const res = await askAssistant({ data: { message: text, sessionId: sessionRef.current } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Something went wrong. Try again, or reach me via the Contact page.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <motion.button
        data-chat-launcher
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-op-accent text-op-bg shadow-[0_10px_40px_-10px_var(--color-op-accent-glow)] sm:bottom-6 sm:right-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "chat"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex p-3"
          >
            {open ? <X size={20} /> : <MessageSquare size={20} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-20 right-4 z-50 flex h-[min(560px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-op-line bg-op-surface/95 shadow-2xl backdrop-blur-xl sm:bottom-24 sm:right-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-op-line px-4 py-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-op-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-op-accent" />
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold text-op-text">Portfolio Assistant</p>
                <p className="font-op-mono text-[10px] uppercase tracking-[0.18em] text-op-text-3">
                  // ask about my work
                </p>
              </div>
              <button
                onClick={resetChat}
                aria-label="New conversation"
                title="New conversation"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-op-text-3 transition-colors hover:bg-op-surface-2 hover:text-op-text"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                      m.role === "user"
                        ? "rounded-br-sm bg-op-accent text-op-bg"
                        : "rounded-bl-sm border border-op-line bg-op-surface-2 text-op-text",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-op-line bg-op-surface-2 px-3.5 py-2.5 text-op-text-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[13px]">thinking…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="flex items-center gap-2 border-t border-op-line p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1000}
                placeholder="Ask a question…"
                className="min-w-0 flex-1 rounded-full border border-op-line bg-op-surface-2 px-4 py-2.5 text-[13.5px] text-op-text placeholder:text-op-text-3 focus:border-op-accent/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-op-accent text-op-bg transition-opacity disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
