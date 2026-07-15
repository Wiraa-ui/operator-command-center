import { PALETTE } from "../types";

/**
 * ROOT ACCESS certificate — generated fully client-side on a canvas and
 * downloaded as PNG. The shareable trophy for visitors who reached the CORE.
 */
export function downloadCertificate(name: string, achievements: string[]) {
  const W = 1200;
  const H = 850;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = "rgba(56,189,248,0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Amber frame
  ctx.strokeStyle = PALETTE.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.strokeStyle = "rgba(245,158,11,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  const mono = "JetBrains Mono, monospace";
  ctx.textAlign = "center";

  ctx.fillStyle = PALETTE.accentBright;
  ctx.font = `600 20px ${mono}`;
  ctx.fillText("// THE SERVER ROOM — ikadekwirawibawa.my.id", W / 2, 110);

  ctx.fillStyle = "#f8fafc";
  ctx.font = `700 76px ${mono}`;
  ctx.fillText("ROOT ACCESS", W / 2, 230);
  ctx.fillStyle = PALETTE.accent;
  ctx.font = `700 40px ${mono}`;
  ctx.fillText("GRANTED", W / 2, 290);

  ctx.fillStyle = "#9fb0cc";
  ctx.font = `16px ${mono}`;
  ctx.fillText("diberikan kepada", W / 2, 370);

  ctx.fillStyle = PALETTE.accentBright;
  ctx.font = `700 52px ${mono}`;
  ctx.fillText(name || "OPERATOR TAMU", W / 2, 440);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = `17px ${mono}`;
  ctx.fillText("yang berhasil menyusup hingga CORE dari server fisik", W / 2, 505);
  ctx.fillText("yang menyajikan halaman ini — guest → operator → root.", W / 2, 532);

  // Achievements
  ctx.fillStyle = PALETTE.secondary;
  ctx.font = `600 15px ${mono}`;
  const shown = achievements.slice(0, 4);
  shown.forEach((a, i) => {
    ctx.fillText(`★ ${a}`, W / 2, 600 + i * 28);
  });

  ctx.fillStyle = "#7c8db0";
  ctx.font = `14px ${mono}`;
  const date = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  ctx.fillText(`${date} · I Kadek Wira Wibawa · Software Engineer`, W / 2, H - 80);

  const a = document.createElement("a");
  a.href = c.toDataURL("image/png");
  a.download = "root-access-certificate.png";
  a.click();
}
