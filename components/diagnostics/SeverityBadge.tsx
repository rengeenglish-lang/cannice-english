import { SEVERITY_LABEL_TR, SEVERITY_ICON } from "@/lib/diagnostics/priority";
import type { DiagnosticSeverity } from "@/lib/generated/prisma/enums";

/** Severity is always icon + label + color together — never color alone. */
export function SeverityBadge({ severity }: { severity: DiagnosticSeverity }) {
  const color =
    severity === "CRITICAL" ? "var(--danger)" : severity === "NEEDS_IMPROVEMENT" ? "var(--warning)" : severity === "DEVELOPING" ? "#c9a227" : "var(--success)";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" style={{ color, backgroundColor: `${color}1a` }}>
      <span aria-hidden="true">{SEVERITY_ICON[severity]}</span>
      {SEVERITY_LABEL_TR[severity]}
    </span>
  );
}
