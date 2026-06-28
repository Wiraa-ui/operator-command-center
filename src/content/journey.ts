export type JourneyCategory = "education" | "experience" | "achievement" | "skills";

export type JourneyEntry = {
  period: string;
  category: JourneyCategory;
  title: string;
  description: string;
  current?: boolean;
};

export const journey: JourneyEntry[] = [
  {
    period: "2023 — 2026",
    category: "education",
    title: "SMK Negeri 1 Gianyar",
    description:
      "Vocational high school, Rekayasa Perangkat Lunak (Software Engineering) track. Focused on functional information systems and high-level conceptual design.",
  },
  {
    period: "2024",
    category: "achievement",
    title: "Juara 3 — KONKTI Web Development Nasional",
    description:
      "National web development competition. Validated self-taught practice and ability to build functional websites under judged conditions.",
  },
  {
    period: "Mei — Nov 2025",
    category: "experience",
    title: "Internship — PT. Bali Media Inspiratif",
    description:
      "Managed client website content, updated product pricing data from Excel to the web, and added new product packages. Built a real-world client website (luungbalistonecarving.biz.id). Learned teamwork and precision in a dynamic environment.",
  },
  {
    period: "2026",
    category: "achievement",
    title: "Juara 2 — Cyber Breaker Development Regional",
    description:
      "Regional development competition (BALI-NTT-NTB). Sharpened problem-solving skills and the habit of designing for recovery.",
  },
];
