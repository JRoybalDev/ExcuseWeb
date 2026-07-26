import { calendarPriorityLabels, calendarSlotLabels, calendarStatusLabels, type CalendarEntry } from "@fullstack-template/schema";

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function dayOfWeekLabel(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

export function calendarEntriesToCsv(entries: CalendarEntry[]): string {
  const header = ["Upload Date", "Day", "Slot", "Video Title / Idea", "Priority", "Status", "Packaging Done?", "Expected Clips", "Notes"];
  const rows = [...entries]
    .sort((a, b) => a.uploadDate.localeCompare(b.uploadDate))
    .map((entry) => [
      entry.uploadDate,
      dayOfWeekLabel(entry.uploadDate),
      calendarSlotLabels[entry.slot],
      entry.title,
      calendarPriorityLabels[entry.priority],
      calendarStatusLabels[entry.status],
      entry.packagingDone ? "Yes" : "No",
      String(entry.expectedClipCount),
      entry.notes
    ]);

  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
}

export function downloadCalendarCsv(entries: CalendarEntry[]) {
  const csv = calendarEntriesToCsv(entries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "content_calendar.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
