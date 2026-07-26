import { scoreTitles, type CalendarEntry, type CalendarEntryDraftInput, type TitleScoreResult } from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../../../shared/apiClient";
import { useDraftStore } from "../../../state/draftStore";
import { SelectDropdown } from "../shared/SelectDropdown";

function entryToDraft(entry: CalendarEntry): CalendarEntryDraftInput {
  return {
    uploadDate: entry.uploadDate,
    slot: entry.slot,
    title: entry.title,
    priority: entry.priority,
    status: entry.status,
    packagingDone: entry.packagingDone,
    expectedClipCount: entry.expectedClipCount,
    notes: entry.notes,
    titleCandidates: entry.titleCandidates
  };
}

function padTitles(candidates: string[]): string[] {
  return [...candidates, "", "", "", "", ""].slice(0, 5);
}

const SAVE_DEBOUNCE_MS = 600;

export function TitleLabTab() {
  const adminKey = useDraftStore((state) => state.adminKey);
  const queryClient = useQueryClient();

  const calendar = useQuery({
    queryKey: ["calendar"],
    queryFn: () => apiClient.calendar.list(adminKey)
  });

  const entries = useMemo(() => [...(calendar.data ?? [])].sort((a, b) => a.uploadDate.localeCompare(b.uploadDate)), [calendar.data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [titles, setTitles] = useState<string[]>(["", "", "", "", ""]);
  const [saveStatus, setSaveStatus] = useState("");
  const seededForRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!selectedId && entries.length > 0) {
      setSelectedId(entries[0]!.id);
    }
  }, [entries, selectedId]);

  useEffect(() => {
    if (!selectedId || seededForRef.current === selectedId) {
      return;
    }
    const entry = entries.find((row) => row.id === selectedId);
    if (!entry) {
      return;
    }
    setTitles(padTitles(entry.titleCandidates));
    seededForRef.current = selectedId;
  }, [selectedId, entries]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updateMutation = useMutation({
    mutationFn: (payload: { entryId: string; draft: CalendarEntryDraftInput }) => apiClient.calendar.update(adminKey, payload.entryId, payload.draft),
    onSuccess: () => {
      setSaveStatus("Saved.");
      void queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (error: Error) => setSaveStatus(error.message)
  });

  function handleTitleChange(index: number, value: string) {
    const entry = entries.find((row) => row.id === selectedId);
    if (!entry) {
      return;
    }

    const next = [...titles];
    next[index] = value;
    setTitles(next);
    setSaveStatus("Typing...");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const candidates = next.map((t) => t.trim()).filter((t) => t !== "");
      updateMutation.mutate({ entryId: entry.id, draft: { ...entryToDraft(entry), titleCandidates: candidates } });
    }, SAVE_DEBOUNCE_MS);
  }

  const results = scoreTitles(titles);
  const scored = results.filter((r): r is TitleScoreResult & { score: number } => r.score !== null).sort((a, b) => b.score - a.score);
  const winner = scored[0];

  return (
    <>
      <div className="admin-intro">
        <span className="admin-eyebrow">Write five, ship the winner</span>
        <h1>Title lab</h1>
        <p>Score follows the packaging rules: length, keyword position, tension over description, and specificity.</p>
      </div>

      {entries.length === 0 ? (
        <p className="admin-eyebrow">Add a video in the Content Calendar first — titles attach to a specific video.</p>
      ) : (
        <>
          <label className="audit-field titlelab-picker">
            <span>Video</span>
            <SelectDropdown
              value={selectedId ?? entries[0]!.id}
              options={entries.map((entry) => ({ value: entry.id, label: `${entry.uploadDate} · ${entry.title || "untitled"}` }))}
              onChange={(value) => setSelectedId(value)}
            />
          </label>

          <div className="template-card titlelab-card">
            <div className="template-card__header">
              <h3>5 title options</h3>
              <span className="schedule-save-bar__status">{saveStatus}</span>
            </div>
            <div className="titlelab-rows">
              {titles.map((title, index) => {
                const result = results[index]!;
                const rank = scored.findIndex((r) => r === result);
                return (
                  <TitleRow
                    key={index}
                    index={index}
                    value={title}
                    result={result}
                    rankLabel={result.score === null ? "—" : rank === 0 ? "★ #1" : `#${rank + 1}`}
                    isWinner={rank === 0 && result.score !== null}
                    onChange={(value) => handleTitleChange(index, value)}
                  />
                );
              })}
            </div>
          </div>

          {winner ? (
            <div className={`diag diag--${winner.score >= 75 ? "ok" : winner.score >= 50 ? "warn" : "fix"}`}>
              <b>WINNER — {winner.score}/100</b>“{winner.title}”
              <br />
              <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                {winner.score >= 75
                  ? "Ship this one."
                  : winner.score >= 50
                    ? "Usable, but fix the red flags above first."
                    : "None of these are ready — rework using the five formulas in Packaging."}
              </span>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

function TitleRow({
  index,
  value,
  result,
  rankLabel,
  isWinner,
  onChange
}: {
  index: number;
  value: string;
  result: TitleScoreResult;
  rankLabel: string;
  isWinner: boolean;
  onChange: (value: string) => void;
}) {
  const scoreColor = result.score === null ? "var(--muted)" : result.score >= 75 ? "var(--ok)" : result.score >= 50 ? "var(--warn)" : "var(--danger)";

  return (
    <div className="titlelab-row">
      <div className="titlelab-row__top">
        <span className="titlelab-row__rank" style={{ color: isWinner ? "var(--accent-strong)" : "var(--muted)", fontWeight: isWinner ? 700 : 400 }}>
          {rankLabel}
        </span>
        <input type="text" value={value} placeholder={`Title option ${index + 1}`} onChange={(event) => onChange(event.target.value)} />
        <span className="titlelab-row__score" style={{ color: scoreColor }}>
          {result.score ?? "—"}
        </span>
      </div>
      <div className="rhythm-minibar">
        <i style={{ width: `${result.score ?? 0}%`, background: scoreColor }} />
      </div>
      <div className="titlelab-row__notes">
        {result.notes.map((note, i) => (
          <span key={i} className={`tag tag--${note.tag}`}>
            {note.message}
          </span>
        ))}
      </div>
    </div>
  );
}
