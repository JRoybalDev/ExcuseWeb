import {
  productionChecklistGroupKey,
  productionChecklistItems,
  productionChecklistPhaseValues,
  sundayStreamChecklistItems,
  sundayStreamGroupKey,
  weeklyRhythmDayValues,
  weeklyRhythmGroupKey,
  weeklyRhythmItems
} from "@fullstack-template/schema";
import { sql } from "drizzle-orm";
import { checklistItems, type NewChecklistItemRow } from "../db/schema.ts";
import { db } from "./db.ts";
import { logger } from "./logger.ts";

// One-time seed: populates `checklist_items` with the default Weekly Rhythm / Sunday stream /
// Production Checklist items on first boot only. After that the table is the live source of
// truth and these code constants are never read again — admins can add/edit/delete freely.
export async function seedDefaultChecklistItems() {
  const countRows = await db.select({ count: sql<number>`count(*)` }).from(checklistItems);

  if (Number(countRows[0]?.count ?? 0) > 0) {
    return;
  }

  const rows: NewChecklistItemRow[] = [];

  for (const day of weeklyRhythmDayValues) {
    weeklyRhythmItems[day].forEach((item, index) => {
      rows.push({ groupKey: weeklyRhythmGroupKey(day), label: item.label, note: item.note ?? "", sortOrder: index });
    });
  }

  sundayStreamChecklistItems.forEach((item, index) => {
    rows.push({ groupKey: sundayStreamGroupKey, label: item.label, note: item.note ?? "", sortOrder: index });
  });

  for (const phase of productionChecklistPhaseValues) {
    productionChecklistItems[phase].forEach((item, index) => {
      rows.push({ groupKey: productionChecklistGroupKey(phase), label: item.label, note: item.note ?? "", sortOrder: index });
    });
  }

  if (rows.length === 0) {
    return;
  }

  await db.insert(checklistItems).values(rows);
  logger.info("checklist_items.seeded", { count: rows.length });
}
