import data from "@/data/resources.json";

// The `$schema` key documents the file for admins; it is not a resource.
export const categories = data.categories;

export const resources = data.resources;

export const featuredResources = resources.filter((r) => r.featured);

export const supplements = data.supplements || [];

export const diagnostics = data.diagnostics || [];

export const RESOURCE_TYPES = [
  "Journal Article",
  "Review",
  "Meta-Analysis",
  "Consensus Statement",
];

// Resolve a `/downloads/...` path against the deployed base path. Locally the
// base is "/", so paths pass through unchanged; on GitHub Pages the site is
// served from a sub-path (e.g. "/bodydouble/") and the files live under it.
export function assetUrl(path) {
  if (typeof path !== "string" || /^(https?:)?\/\//.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

// Format a publication date for display. Accepts a full ISO date
// ("2020-06-01" → "June 2020") or a bare year ("2012" → "2012"), because the
// exact month is not always known for older papers.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatPublishDate(iso) {
  if (typeof iso !== "string") return "";
  const [year, month] = iso.split("-");
  if (!month) return year;
  const idx = Number(month) - 1;
  if (!year || Number.isNaN(idx) || idx < 0 || idx > 11) return iso;
  return `${MONTHS[idx]} ${year}`;
}
