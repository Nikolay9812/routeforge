import { ShiftFilters } from "@/components/shifts/ShiftFilters";
import {
  type AdminShiftTone,
} from "@/lib/adminShifts";
import { loadAdminShiftPageData } from "@/lib/adminShifts.server";

const toneClasses: Record<
  AdminShiftTone,
  {
    badge: string;
    dot: string;
    soft: string;
    text: string;
  }
> = {
  primary: {
    badge: "bg-primary-lightest text-primary-darker",
    dot: "bg-primary",
    soft: "border-primary-light bg-primary-lightest",
    text: "text-primary",
  },
  info: {
    badge: "bg-info-lightest text-info-foreground",
    dot: "bg-info",
    soft: "border-info-light bg-info-lightest",
    text: "text-info-foreground",
  },
  success: {
    badge: "bg-success-lightest text-success-foreground",
    dot: "bg-success",
    soft: "border-success-light bg-success-lightest",
    text: "text-success-foreground",
  },
  warning: {
    badge: "bg-warning-lightest text-warning-foreground",
    dot: "bg-warning",
    soft: "border-warning-light bg-warning-lightest",
    text: "text-warning-foreground",
  },
  error: {
    badge: "bg-error-lightest text-error-foreground",
    dot: "bg-error",
    soft: "border-error-light bg-error-lightest",
    text: "text-error-foreground",
  },
  neutral: {
    badge: "bg-neutral-light text-neutral-foreground",
    dot: "bg-neutral",
    soft: "border-border bg-neutral-light",
    text: "text-neutral-foreground",
  },
};

function SummaryTile({
  label,
  tone,
  value,
}: {
  label: string;
  tone: AdminShiftTone;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${toneClasses[tone].dot}`}
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-text-secondary">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold leading-9 text-text-primary">
        {value}
      </p>
    </div>
  );
}

export default async function AdminShiftsPage() {
  const { filterOptions, shifts, summary } = await loadAdminShiftPageData();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Schichtverwaltung
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[38px] text-text-primary">
              Schichten
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Pruefe eingereichte Schichten, erkenne Geofence-Warnungen und
              oeffne einzelne Berichte fuer die Detailpruefung.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-lightest px-3 py-1 text-xs font-semibold text-primary-darker">
              Live-Daten
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Eingereicht"
          tone="info"
          value={String(summary.submitted)}
        />
        <SummaryTile
          label="In Pruefung"
          tone="warning"
          value={String(summary.underReview)}
        />
        <SummaryTile
          label="Heute genehmigt"
          tone="success"
          value={String(summary.approvedToday)}
        />
        <SummaryTile
          label="Geofence-Warnungen"
          tone="error"
          value={String(summary.geofenceWarnings)}
        />
      </section>

      <ShiftFilters filterOptions={filterOptions} shifts={shifts} />
    </div>
  );
}
