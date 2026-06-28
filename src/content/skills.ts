export type SkillSource = "otodidak" | "sekolah" | "internship" | "project";

export type Skill = {
  name: string;
  source: SkillSource;
};

export type SkillGroup = {
  domain: string;
  blurb: string;
  skills: Skill[];
};

export const sourceLabel: Record<SkillSource, string> = {
  otodidak: "otodidak",
  sekolah: "sekolah",
  internship: "internship",
  project: "project",
};

export const skillGroups: SkillGroup[] = [
  {
    domain: "Web Development",
    blurb: "Membangun dan mengelola website untuk klien dan kebutuhan bisnis.",
    skills: [
      { name: "Manajemen Website", source: "internship" },
      { name: "Pemrograman Dasar", source: "sekolah" },
      { name: "HTML / CSS / JavaScript", source: "sekolah" },
    ],
  },
  {
    domain: "Administrasi & Data",
    blurb: "Pengelolaan data fungsional untuk kebutuhan operasional.",
    skills: [
      { name: "Word/Excel Basic", source: "sekolah" },
      { name: "Update Data Produk", source: "internship" },
      { name: "Ketelitian Data", source: "internship" },
    ],
  },
  {
    domain: "Multimedia & Desain",
    blurb: "Kemampuan dalam pengelolaan aset visual dan editing.",
    skills: [
      { name: "Basic Editing", source: "otodidak" },
      { name: "Desain Konseptual Otomotif", source: "sekolah" },
    ],
  },
  {
    domain: "Soft Skills",
    blurb: "Bekerja secara kolaboratif di lingkungan yang dinamis.",
    skills: [
      { name: "Kerja Sama Tim", source: "internship" },
      { name: "Problem Solving", source: "project" },
    ],
  },
];
