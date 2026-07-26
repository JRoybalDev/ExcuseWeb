import { diagnoseAudit, type AuditDiagnosisCard, type AuditRunDraftInput } from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiSave, FiTrash2 } from "react-icons/fi";
import { apiClient } from "../../../shared/apiClient";
import { useDraftStore } from "../../../state/draftStore";

type AuditFormState = {
  auditDate: string;
  ctrPercent: string;
  avgPercentViewed: string;
  viewsThisPeriod: string;
  viewsPriorPeriod: string;
  subsGainedThisPeriod: string;
  subsGainedPriorPeriod: string;
  shortsViewsThisPeriod: string;
  shortsViewsPriorPeriod: string;
  revenueThisPeriod: string;
  revenuePriorPeriod: string;
  notes: string;
};

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const emptyForm: AuditFormState = {
  auditDate: todayIso(),
  ctrPercent: "",
  avgPercentViewed: "",
  viewsThisPeriod: "",
  viewsPriorPeriod: "",
  subsGainedThisPeriod: "",
  subsGainedPriorPeriod: "",
  shortsViewsThisPeriod: "",
  shortsViewsPriorPeriod: "",
  revenueThisPeriod: "",
  revenuePriorPeriod: "",
  notes: ""
};

function parseRequired(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseOptional(value: string): number {
  const n = Number(value);
  return value.trim() === "" || !Number.isFinite(n) ? 0 : n;
}

export function AuditTab() {
  const queryClient = useQueryClient();
  const adminKey = useDraftStore((state) => state.adminKey);
  const [form, setForm] = useState<AuditFormState>(emptyForm);
  const [actionError, setActionError] = useState("");

  const auditRuns = useQuery({
    queryKey: ["audit-runs"],
    queryFn: () => apiClient.audit.list(adminKey)
  });

  const createRun = useMutation({
    mutationFn: (draft: AuditRunDraftInput) => apiClient.audit.create(adminKey, draft),
    onSuccess: () => {
      setActionError("");
      setForm(emptyForm);
      void queryClient.invalidateQueries({ queryKey: ["audit-runs"] });
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const deleteRun = useMutation({
    mutationFn: (id: string) => apiClient.audit.delete(adminKey, id),
    onSuccess: () => {
      setActionError("");
      void queryClient.invalidateQueries({ queryKey: ["audit-runs"] });
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const required = useMemo(
    () => ({
      ctrPercent: parseRequired(form.ctrPercent),
      avgPercentViewed: parseRequired(form.avgPercentViewed),
      viewsThisPeriod: parseRequired(form.viewsThisPeriod),
      viewsPriorPeriod: parseRequired(form.viewsPriorPeriod),
      subsGainedThisPeriod: parseRequired(form.subsGainedThisPeriod),
      subsGainedPriorPeriod: parseRequired(form.subsGainedPriorPeriod)
    }),
    [form]
  );

  const hasAllRequired = Object.values(required).every((value) => value !== null);

  const diagnosis = useMemo(() => {
    if (!hasAllRequired) {
      return null;
    }
    return diagnoseAudit({
      ctrPercent: required.ctrPercent!,
      avgPercentViewed: required.avgPercentViewed!,
      viewsThisPeriod: required.viewsThisPeriod!,
      viewsPriorPeriod: required.viewsPriorPeriod!,
      subsGainedThisPeriod: required.subsGainedThisPeriod!,
      subsGainedPriorPeriod: required.subsGainedPriorPeriod!,
      shortsViewsThisPeriod: parseOptional(form.shortsViewsThisPeriod),
      shortsViewsPriorPeriod: parseOptional(form.shortsViewsPriorPeriod),
      revenueThisPeriod: parseOptional(form.revenueThisPeriod),
      revenuePriorPeriod: parseOptional(form.revenuePriorPeriod)
    });
  }, [hasAllRequired, required, form.shortsViewsThisPeriod, form.shortsViewsPriorPeriod, form.revenueThisPeriod, form.revenuePriorPeriod]);

  function field(key: keyof AuditFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function saveRun() {
    if (!diagnosis || !hasAllRequired) {
      return;
    }

    createRun.mutate({
      auditDate: form.auditDate,
      ctrPercent: required.ctrPercent!,
      avgPercentViewed: required.avgPercentViewed!,
      viewsThisPeriod: required.viewsThisPeriod!,
      viewsPriorPeriod: required.viewsPriorPeriod!,
      subsGainedThisPeriod: required.subsGainedThisPeriod!,
      subsGainedPriorPeriod: required.subsGainedPriorPeriod!,
      shortsViewsThisPeriod: parseOptional(form.shortsViewsThisPeriod),
      shortsViewsPriorPeriod: parseOptional(form.shortsViewsPriorPeriod),
      revenueThisPeriod: parseOptional(form.revenueThisPeriod),
      revenuePriorPeriod: parseOptional(form.revenuePriorPeriod),
      notes: form.notes,
      diagnosis
    });
  }

  return (
    <>
      <div className="admin-intro">
        <span className="admin-eyebrow">Every two weeks</span>
        <h1>14-day audit</h1>
        <p>Pull these from YouTube Studio (Analytics → last 14 days), diagnose the bottleneck, and save a record to track over time.</p>
      </div>

      <div className="audit-card">
        <div className="audit-grid">
          <AuditField label="Audit date" type="date" value={form.auditDate} onChange={(v) => field("auditDate", v)} />
          <AuditField label="CTR (%)" required value={form.ctrPercent} onChange={(v) => field("ctrPercent", v)} placeholder="this period" />
          <AuditField label="Avg % viewed" required value={form.avgPercentViewed} onChange={(v) => field("avgPercentViewed", v)} placeholder="this period" />
          <AuditPairField
            label="Total views — this / prior"
            valueThis={form.viewsThisPeriod}
            valuePrior={form.viewsPriorPeriod}
            onChangeThis={(v) => field("viewsThisPeriod", v)}
            onChangePrior={(v) => field("viewsPriorPeriod", v)}
            required
          />
          <AuditPairField
            label="Subs gained — this / prior"
            valueThis={form.subsGainedThisPeriod}
            valuePrior={form.subsGainedPriorPeriod}
            onChangeThis={(v) => field("subsGainedThisPeriod", v)}
            onChangePrior={(v) => field("subsGainedPriorPeriod", v)}
            required
          />
          <AuditPairField
            label="Shorts views — this / prior"
            valueThis={form.shortsViewsThisPeriod}
            valuePrior={form.shortsViewsPriorPeriod}
            onChangeThis={(v) => field("shortsViewsThisPeriod", v)}
            onChangePrior={(v) => field("shortsViewsPriorPeriod", v)}
          />
          <AuditPairField
            label="Revenue ($) — this / prior"
            valueThis={form.revenueThisPeriod}
            valuePrior={form.revenuePriorPeriod}
            onChangeThis={(v) => field("revenueThisPeriod", v)}
            onChangePrior={(v) => field("revenuePriorPeriod", v)}
            step="0.01"
          />
        </div>

        <label className="audit-notes">
          <span>Notes (optional)</span>
          <textarea rows={2} value={form.notes} onChange={(event) => field("notes", event.target.value)} placeholder="Anything worth remembering about this period" />
        </label>

        {actionError ? <p className="admin-error">{actionError}</p> : null}

        <div className="audit-card__footer">
          <span className="schedule-save-bar__status">{hasAllRequired ? "Diagnosis ready." : "Enter CTR, avg % viewed, views, and subs to see a diagnosis."}</span>
          <button className="admin-button admin-button--primary" type="button" disabled={!hasAllRequired || createRun.isPending} onClick={saveRun}>
            <FiSave aria-hidden /> {createRun.isPending ? "Saving..." : "Save audit run"}
          </button>
        </div>
      </div>

      {diagnosis ? <DiagnosisCards diagnosis={diagnosis} /> : null}

      <div className="audit-history">
        <h2 className="template-section__title">History</h2>
        {auditRuns.isLoading ? <p className="admin-eyebrow">Loading...</p> : null}
        {auditRuns.data && auditRuns.data.length === 0 ? <p className="admin-eyebrow">No audit runs saved yet.</p> : null}
        {auditRuns.data?.map((run) => (
          <div className="audit-history__row" key={run.id}>
            <div className="audit-history__row-main">
              <span className="audit-history__date">{run.auditDate}</span>
              <span>CTR {run.ctrPercent}%</span>
              <span>Avg viewed {run.avgPercentViewed}%</span>
              <span>
                {run.viewsThisPeriod} vs {run.viewsPriorPeriod} views
              </span>
            </div>
            <button className="schedule-row__delete" type="button" aria-label="Delete audit run" onClick={() => deleteRun.mutate(run.id)}>
              <FiTrash2 aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function DiagnosisCards({ diagnosis }: { diagnosis: { cards: AuditDiagnosisCard[]; crossMetric: AuditDiagnosisCard[] } }) {
  return (
    <div className="audit-diagnosis">
      {[...diagnosis.cards, ...diagnosis.crossMetric].map((card) => (
        <div className={`diag diag--${card.status}`} key={card.key}>
          <b>{card.label}</b>
          {card.message}
        </div>
      ))}
    </div>
  );
}

function AuditField({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "number",
  step
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  step?: string;
}) {
  return (
    <label className="audit-field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      <input type={type} step={step ?? "0.1"} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function AuditPairField({
  label,
  valueThis,
  valuePrior,
  onChangeThis,
  onChangePrior,
  required,
  step
}: {
  label: string;
  valueThis: string;
  valuePrior: string;
  onChangeThis: (value: string) => void;
  onChangePrior: (value: string) => void;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="audit-field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      <div className="audit-field__pair">
        <input type="number" step={step ?? "1"} value={valueThis} placeholder="this" onChange={(event) => onChangeThis(event.target.value)} />
        <input type="number" step={step ?? "1"} value={valuePrior} placeholder="prior" onChange={(event) => onChangePrior(event.target.value)} />
      </div>
    </label>
  );
}
