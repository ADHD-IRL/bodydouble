import data from "@/data/resources.json";

// The `$schema` key documents the file for admins; it is not a resource.
export const categories = data.categories;

export const resources = data.resources;

export const featuredResources = resources.filter((r) => r.featured);

export const supplements = data.supplements || [];

export const RESOURCE_TYPES = [
  "Whitepaper",
  "Clinical Study",
  "Worksheet",
  "Toolkit",
];

// Format an ISO date (YYYY-MM-DD) as e.g. "September 2025" without pulling in
// a date library or tripping on timezone offsets from `new Date("YYYY-MM-DD")`.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatPublishDate(iso) {
  if (typeof iso !== "string") return "";
  const [year, month] = iso.split("-");
  const idx = Number(month) - 1;
  if (!year || Number.isNaN(idx) || idx < 0 || idx > 11) return iso;
  return `${MONTHS[idx]} ${year}`;
}
