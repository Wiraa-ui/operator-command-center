export type Achievement = {
  glyph: string; // small geometric mark, not emoji-heavy
  title: string;
  detail: string;
};

export const achievements: Achievement[] = [
  {
    glyph: "◆",
    title: "KONKTI — IT competition placement",
    detail:
      "Regional IT competition. Validated self-taught technical depth under timed, judged conditions.",
  },
  {
    glyph: "▲",
    title: "Cyber Breaker — security competition placement",
    detail:
      "Security-focused competition. Sharpened the habit of assuming failure and designing for recovery.",
  },
];
