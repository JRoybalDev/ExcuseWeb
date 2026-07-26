import {
  scheduleDayLabels,
  scheduleDayValues,
  scheduleEntryTypeLabels,
  scheduleEntryTypeValues,
  type ScheduleDay,
  type ScheduleEntry,
  type ScheduleEntryType
} from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { FiExternalLink, FiLock, FiLogOut, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { apiClient } from "../shared/apiClient";
import { setDocumentTitle, siteConfig } from "../shared/siteConfig";
import { useDraftStore } from "../state/draftStore";
import { useThemeMode } from "../state/themeStore";

type DraftEntry = {
  dayOfWeek: ScheduleDay;
  time: string;
  type: ScheduleEntryType;
  title: string;
  thumbnailUrl: string;
  uploadId: string | null;
};

const emptyDraft: DraftEntry = { dayOfWeek: "mon", time: "", type: "video", title: "", thumbnailUrl: "", uploadId: null };

function entryToDraft(entry: ScheduleEntry): DraftEntry {
  return { dayOfWeek: entry.dayOfWeek, time: entry.time, type: entry.type, title: entry.title, thumbnailUrl: entry.thumbnailUrl, uploadId: entry.uploadId };
}

function sortByDay(rows: ScheduleEntry[]) {
  return [...rows].sort((a, b) => scheduleDayValues.indexOf(a.dayOfWeek) - scheduleDayValues.indexOf(b.dayOfWeek));
}

export function Dashboard() {
  const queryClient = useQueryClient();
  const { resolvedTheme } = useThemeMode();
  const adminKey = useDraftStore((state) => state.adminKey);
  const setAdminKey = useDraftStore((state) => state.setAdminKey);
  const clearAdminKey = useDraftStore((state) => state.clearAdminKey);
  const hasAdminKey = adminKey.length > 0;

  useEffect(() => {
    setDocumentTitle(siteConfig.dashboardPageName);
  }, []);

  const session = useQuery({
    queryKey: ["admin-session", adminKey],
    queryFn: () => apiClient.admin.verifySession(adminKey),
    enabled: hasAdminKey,
    retry: false
  });

  const schedule = useQuery({
    queryKey: ["schedule"],
    queryFn: () => apiClient.schedule.list(),
    enabled: session.isSuccess
  });

  const [rows, setRows] = useState<ScheduleEntry[] | null>(null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [addingEntry, setAddingEntry] = useState(false);
  const [draftEntry, setDraftEntry] = useState<DraftEntry>(emptyDraft);

  useEffect(() => {
    if (rows === null && schedule.data) {
      setRows(sortByDay(schedule.data));
    }
  }, [rows, schedule.data]);

  useEffect(() => {
    function warnOnUnload(event: BeforeUnloadEvent) {
      if (dirtyIds.size > 0) {
        event.preventDefault();
      }
    }

    window.addEventListener("beforeunload", warnOnUnload);
    return () => window.removeEventListener("beforeunload", warnOnUnload);
  }, [dirtyIds]);

  function invalidateSchedule() {
    void queryClient.invalidateQueries({ queryKey: ["schedule"] });
  }

  function markDirty(id: string) {
    setSaveMessage("");
    setDirtyIds((current) => new Set(current).add(id));
  }

  function updateRowField(id: string, changes: Partial<ScheduleEntry>) {
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, ...changes } : row)) ?? current);
    markDirty(id);
  }

  const createEntry = useMutation({
    mutationFn: (input: DraftEntry) => apiClient.schedule.create(adminKey, input),
    onSuccess: (created) => {
      setActionError("");
      setAddingEntry(false);
      setDraftEntry(emptyDraft);
      setRows((current) => sortByDay([...(current ?? []), created]));
      invalidateSchedule();
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => apiClient.schedule.delete(adminKey, id),
    onSuccess: (_deleted, id) => {
      setActionError("");
      setRows((current) => current?.filter((row) => row.id !== id) ?? current);
      setDirtyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      invalidateSchedule();
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const uploadThumbnail = useMutation({
    mutationFn: (file: File) => apiClient.uploads.create(adminKey, file),
    onError: (error: Error) => setActionError(error.message)
  });

  async function lockDashboard() {
    clearAdminKey();
    void queryClient.invalidateQueries({ queryKey: ["admin-session"] });
  }

  async function handleRowThumbnail(id: string, file: File) {
    const upload = await uploadThumbnail.mutateAsync(file);
    updateRowField(id, { thumbnailUrl: upload.thumbnailUrl || upload.url, uploadId: upload.id });
  }

  async function saveDraftThumbnail(file: File) {
    const upload = await uploadThumbnail.mutateAsync(file);
    setDraftEntry((current) => ({ ...current, thumbnailUrl: upload.thumbnailUrl || upload.url, uploadId: upload.id }));
  }

  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftEntry.title.trim()) {
      return;
    }
    createEntry.mutate(draftEntry);
  }

  async function saveAllChanges() {
    if (!rows || dirtyIds.size === 0 || isSaving) {
      return;
    }

    setIsSaving(true);
    setActionError("");
    setSaveMessage("");

    const idsToSave = [...dirtyIds];
    const results = await Promise.allSettled(
      idsToSave.map((id) => {
        const row = rows.find((candidate) => candidate.id === id);
        return row ? apiClient.schedule.update(adminKey, id, entryToDraft(row)) : Promise.resolve(null);
      })
    );

    const failedIds: string[] = [];
    let firstError = "";

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        failedIds.push(idsToSave[index]!);
        firstError = firstError || (result.reason instanceof Error ? result.reason.message : "Failed to save entry.");
      }
    });

    setDirtyIds(new Set(failedIds));
    setIsSaving(false);

    if (failedIds.length > 0) {
      setActionError(firstError);
    } else {
      setSaveMessage("Saved.");
      invalidateSchedule();
    }
  }

  if (!session.isSuccess) {
    return <DashboardAccessGate isChecking={session.isLoading} isInvalid={session.isError} onUnlock={(code) => setAdminKey(code)} />;
  }

  const entries = rows ?? [];
  const hasUnsavedChanges = dirtyIds.size > 0;

  return (
    <div className={`admin-dashboard dashboard-theme-${resolvedTheme}`}>
      <header className="admin-header">
        <div className="admin-header__brand">
          <span className="admin-header__mark">EJ</span>
          <span className="admin-header__name">Operations Center</span>
          <span className="admin-tag">admin</span>
        </div>
        <div className="admin-header__actions">
          <Link className="admin-header__link" to="/" target="_blank" rel="noreferrer">
            View live site <FiExternalLink aria-hidden />
          </Link>
          <span className="admin-status-pill">
            <span className="admin-status-pill__dot" />
            Published — changes go live instantly
          </span>
          <button className="admin-button admin-button--secondary" type="button" onClick={() => void lockDashboard()}>
            <FiLogOut aria-hidden /> Sign out
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-main__inner">
          <div className="admin-intro">
            <span className="admin-eyebrow">Placeholder site — one section live</span>
            <h1>Weekly schedule</h1>
            <p>The site countdown updates automatically. Everything else on the dashboard is hidden until the full site launches.</p>
          </div>

          <div className="schedule-editor-card">
            {entries.map((entry) => (
              <ScheduleRow
                key={entry.id}
                entry={entry}
                onChangeDay={(dayOfWeek) => updateRowField(entry.id, { dayOfWeek })}
                onChangeTime={(time) => updateRowField(entry.id, { time })}
                onChangeType={(type) => updateRowField(entry.id, { type })}
                onChangeTitle={(title) => updateRowField(entry.id, { title })}
                onUploadThumbnail={(file) => void handleRowThumbnail(entry.id, file)}
                onDelete={() => deleteEntry.mutate(entry.id)}
              />
            ))}

            {addingEntry ? (
              <form className="schedule-add-form" onSubmit={submitDraft}>
                <div className="schedule-add-form__fields">
                  <label>
                    <span>Day</span>
                    <select value={draftEntry.dayOfWeek} onChange={(event) => setDraftEntry((c) => ({ ...c, dayOfWeek: event.target.value as ScheduleDay }))}>
                      {scheduleDayValues.map((day) => (
                        <option key={day} value={day}>
                          {scheduleDayLabels[day]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Time</span>
                    <input
                      placeholder="10:00 AM PST"
                      value={draftEntry.time}
                      onChange={(event) => setDraftEntry((c) => ({ ...c, time: event.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Type</span>
                    <select value={draftEntry.type} onChange={(event) => setDraftEntry((c) => ({ ...c, type: event.target.value as ScheduleEntryType }))}>
                      {scheduleEntryTypeValues.map((type) => (
                        <option key={type} value={type}>
                          {scheduleEntryTypeLabels[type]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Title</span>
                    <input
                      placeholder="Episode title"
                      value={draftEntry.title}
                      onChange={(event) => setDraftEntry((c) => ({ ...c, title: event.target.value }))}
                    />
                  </label>
                </div>
                <ThumbnailSlot url={draftEntry.thumbnailUrl} onUpload={(file) => void saveDraftThumbnail(file)} />
                <div className="schedule-add-form__actions">
                  <button
                    className="admin-button admin-button--secondary"
                    type="button"
                    onClick={() => {
                      setAddingEntry(false);
                      setDraftEntry(emptyDraft);
                    }}
                  >
                    Cancel
                  </button>
                  <button className="admin-button admin-button--primary" type="submit" disabled={createEntry.isPending}>
                    {createEntry.isPending ? "Adding..." : "Add entry"}
                  </button>
                </div>
              </form>
            ) : (
              <button className="admin-button admin-button--secondary" type="button" onClick={() => setAddingEntry(true)}>
                <FiPlus aria-hidden /> Add entry
              </button>
            )}

            {actionError ? <p className="admin-error">{actionError}</p> : null}

            <div className="schedule-save-bar">
              <span className="schedule-save-bar__status">
                {isSaving ? "Saving..." : hasUnsavedChanges ? "You have unsaved changes." : saveMessage || "All changes saved."}
              </span>
              <button className="admin-button admin-button--primary" type="button" disabled={!hasUnsavedChanges || isSaving} onClick={() => void saveAllChanges()}>
                <FiSave aria-hidden /> {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ScheduleRow({
  entry,
  onChangeDay,
  onChangeTime,
  onChangeType,
  onChangeTitle,
  onUploadThumbnail,
  onDelete
}: {
  entry: ScheduleEntry;
  onChangeDay: (day: ScheduleDay) => void;
  onChangeTime: (time: string) => void;
  onChangeType: (type: ScheduleEntryType) => void;
  onChangeTitle: (title: string) => void;
  onUploadThumbnail: (file: File) => void;
  onDelete: () => void;
}) {
  return (
    <div className="schedule-row">
      <select className="schedule-row__day" value={entry.dayOfWeek} onChange={(event) => onChangeDay(event.target.value as ScheduleDay)}>
        {scheduleDayValues.map((day) => (
          <option key={day} value={day}>
            {scheduleDayLabels[day]}
          </option>
        ))}
      </select>
      <input value={entry.time} onChange={(event) => onChangeTime(event.target.value)} placeholder="Time" />
      <select value={entry.type} onChange={(event) => onChangeType(event.target.value as ScheduleEntryType)}>
        {scheduleEntryTypeValues.map((type) => (
          <option key={type} value={type}>
            {scheduleEntryTypeLabels[type]}
          </option>
        ))}
      </select>
      <input value={entry.title} onChange={(event) => onChangeTitle(event.target.value)} placeholder="Title" />
      <ThumbnailSlot url={entry.thumbnailUrl} onUpload={onUploadThumbnail} compact />
      <button className="schedule-row__delete" type="button" aria-label="Delete entry" onClick={onDelete}>
        <FiTrash2 aria-hidden />
      </button>
    </div>
  );
}

function ThumbnailSlot({ url, onUpload, compact }: { url: string; onUpload: (file: File) => void; compact?: boolean }) {
  const inputId = `thumb-${Math.random().toString(36).slice(2)}`;

  return (
    <label htmlFor={inputId} className={compact ? "thumbnail-slot thumbnail-slot--compact" : "thumbnail-slot"}>
      {url ? <img src={url} alt="" /> : <span>Img</span>}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onUpload(file);
          }
          event.target.value = "";
        }}
      />
    </label>
  );
}

function DashboardAccessGate({
  isChecking,
  isInvalid,
  onUnlock
}: {
  isChecking: boolean;
  isInvalid: boolean;
  onUnlock: (code: string) => void;
}) {
  const [code, setCode] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUnlock(code.trim());
  }

  return (
    <div className="admin-gate">
      <div className="admin-gate-bg" style={{ backgroundImage: "url(/background.jpg)" }} />
      <div className="admin-gate-scrim" />
      <form className="admin-gate__panel" onSubmit={submit}>
        <img className="admin-gate__logo" src="/logo.png" alt="ExcuseMeImJack" />
        <div className="admin-gate__copy">
          <h1>Operations Center</h1>
          <p>Keys to the park, please.</p>
        </div>
        <label className="admin-gate__field">
          <span>Password</span>
          <input type="password" placeholder="••••••••" value={code} onChange={(event) => setCode(event.target.value)} autoFocus />
        </label>
        <button className="admin-button admin-button--primary admin-gate__submit" type="submit" disabled={isChecking || code.length === 0}>
          <FiLock aria-hidden /> {isChecking ? "Checking..." : "Open the gates"}
        </button>
        {isInvalid ? <p className="admin-error">Incorrect password.</p> : null}
      </form>
    </div>
  );
}
