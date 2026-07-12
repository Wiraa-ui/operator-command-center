import { flagshipProject, secondaryProjects } from "@/content/projects";
import { site } from "@/content/site";
import { skillGroups } from "@/content/skills";
import { RACK_SPACING, type Station } from "./types";

/**
 * Builds the corridor itinerary from real site content — the single place
 * that decides what lives at which rack. Order: entrance → flagship →
 * secondary projects (alternating sides) → skills → live status → contact.
 */
export function getStations(): Station[] {
  const stations: Station[] = [
    {
      id: "entrance",
      kind: "entrance",
      z: 0,
      side: "center",
      title: site.name,
      subtitle: `${site.role} — ${site.availability}`,
    },
  ];

  const projects = [flagshipProject, ...secondaryProjects];
  projects.forEach((p, i) => {
    stations.push({
      id: p.slug,
      kind: "project",
      z: -(i + 1) * RACK_SPACING,
      side: i % 2 === 0 ? "left" : "right",
      title: p.title,
      subtitle: p.tagline,
      href: `/projects/${p.slug}`,
      project: { slug: p.slug, title: p.title, tagline: p.tagline, stack: p.stack },
    });
  });

  let z = -(projects.length + 1) * RACK_SPACING;
  stations.push({
    id: "skills",
    kind: "skills",
    z,
    side: projects.length % 2 === 0 ? "left" : "right",
    title: "Capabilities",
    subtitle: skillGroups.map((g) => g.domain).join(" · "),
    href: "/about",
  });

  z -= RACK_SPACING;
  stations.push({
    id: "status",
    kind: "status",
    z,
    side: projects.length % 2 === 0 ? "right" : "left",
    title: "This very server",
    subtitle: "Live telemetry from the machine rendering this room",
  });

  z -= RACK_SPACING;
  stations.push({
    id: "contact",
    kind: "contact",
    z,
    side: "center",
    title: "Let's connect",
    subtitle: site.availability,
    href: "/contact",
  });

  return stations;
}
