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
    period: "2020 — 2023",
    category: "education",
    title: "SMK TI Bali Global",
    description:
      "Vocational high school, IT track. First structured exposure to networks, systems, and the discipline of making things actually work.",
  },
  {
    period: "2022",
    category: "achievement",
    title: "KONKTI — competition placement",
    description:
      "Regional IT competition. Validated that self-taught practice held up under timed, judged conditions.",
  },
  {
    period: "2023",
    category: "achievement",
    title: "Cyber Breaker — competition placement",
    description:
      "Security-focused competition. Reinforced the operator mindset: assume failure, design for recovery.",
  },
  {
    period: "2023",
    category: "experience",
    title: "Internship — invoice & payroll systems",
    description:
      "Six-month internship. Delivered the invoice automation and payroll workbook now in active use.",
  },
  {
    period: "2023 — 2025",
    category: "education",
    title: "Universitas (ongoing study)",
    description:
      "Continuing formal study while operating real systems in parallel. Theory and practice on the same calendar.",
  },
  {
    period: "2024 — present",
    category: "skills",
    title: "Self-hosted infrastructure practice",
    description:
      "Built and maintained the Ubuntu stack. Moved from consuming managed services to operating my own.",
  },
  {
    period: "2025 — present",
    category: "experience",
    title: "IT Administrator @ Kumon Udayana",
    description:
      "Current role. Operating day-to-day IT, building the Internal Knowledge Assistant, and refining the systems that keep the centre running.",
    current: true,
  },
];
