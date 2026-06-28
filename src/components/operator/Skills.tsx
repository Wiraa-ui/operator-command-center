import { motion } from "framer-motion";
import { LayoutTemplate, ServerCog, DatabaseZap } from "lucide-react";
import { SpotlightCard } from "@/components/ui/motion/SpotlightCard";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion/StaggerContainer";

const skills = [
  {
    title: "Frontend & Interface",
    icon: LayoutTemplate,
    description:
      "React, TypeScript, dan Tailwind CSS. Membangun antarmuka yang cepat, responsif, dan mengutamakan aksesibilitas tanpa kerumitan yang tak perlu.",
  },
  {
    title: "Backend & Infrastructure",
    icon: ServerCog,
    description:
      "Node.js, Bun, Linux (Ubuntu), dan Docker. Mengelola server sungguhan, deployment stabil, dan menjaga uptime dengan systemd.",
  },
  {
    title: "Data & Automation",
    icon: DatabaseZap,
    description:
      "PostgreSQL, Telegram Bots, dan Cloudflare Tunnels. Menghubungkan sistem, mengelola data secara presisi, dan mengotomatiskan alur kerja operasional.",
  },
];

export function Skills() {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-3">
      {skills.map((skill, i) => (
        <StaggerItem key={i} className="h-full">
          <SpotlightCard className="h-full rounded-2xl border border-op-line bg-op-surface p-8 transition-colors duration-300 hover:bg-op-surface-2">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-op-line bg-[#07090e] text-op-accent shadow-[0_0_15px_rgba(45,212,191,0.1)]">
              <motion.div
                whileHover={{ scale: 1.1, rotate: i === 1 ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <skill.icon className="h-6 w-6" strokeWidth={1.5} />
              </motion.div>
            </div>
            <h3 className="mb-3 text-[18px] font-semibold leading-[1.2] text-op-text">
              {skill.title}
            </h3>
            <p className="text-[15px] leading-[1.65] text-op-text-2">{skill.description}</p>
          </SpotlightCard>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
