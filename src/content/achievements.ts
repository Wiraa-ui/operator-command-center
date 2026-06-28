export type Achievement = {
  glyph: string; // small geometric mark, not emoji-heavy
  title: string;
  detail: string;
};

export const achievements: Achievement[] = [
  {
    glyph: "◆",
    title: "Juara 3 – KONKTI Web Development Nasional 2024",
    detail:
      "National web development competition. Validated self-taught technical depth and ability to build functional websites under judged conditions.",
  },
  {
    glyph: "▲",
    title: "Juara 2 Regional BALI-NTT-NTB – Cyber Breaker Development 2026",
    detail:
      "Regional development and security-focused competition. Sharpened problem-solving skills and the habit of designing for recovery.",
  },
];
