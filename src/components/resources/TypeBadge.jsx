import { FileText, FlaskConical, ClipboardList, Wrench } from "lucide-react";

// Maps each resource `type` to an icon and a calm accent (green/blue only).
const TYPE_META = {
  Whitepaper: { Icon: FileText, accent: "var(--rx-blue)" },
  "Clinical Study": { Icon: FlaskConical, accent: "var(--rx-cyan)" },
  Worksheet: { Icon: ClipboardList, accent: "var(--rx-sage)" },
  Toolkit: { Icon: Wrench, accent: "var(--rx-forest)" },
};

export default function TypeBadge({ type, className = "" }) {
  const { Icon, accent } = TYPE_META[type] || TYPE_META.Whitepaper;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.09em] ${className}`}
      style={{
        color: `hsl(${accent})`,
        borderColor: `hsl(${accent} / 0.35)`,
        backgroundColor: `hsl(${accent} / 0.08)`,
      }}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {type}
    </span>
  );
}
