import { newId } from "./geometry";
import type { TextRow, TopperSettings } from "../types";

export function createRow(partial: Partial<TextRow> & Pick<TextRow, "text" | "fontId">): TextRow {
  return {
    id: newId(),
    size: 56,
    offsetX: 0,
    offsetY: 0,
    color: "#ffffff",
    ...partial,
  };
}

export function normalizeSettings(settings: TopperSettings): TopperSettings {
  return {
    ...settings,
    rows: settings.rows.map((row) => ({
      ...row,
      offsetX: row.offsetX ?? 0,
      offsetY: row.offsetY ?? 0,
      color: row.color ?? settings.textColor ?? "#ffffff",
    })),
    sticksEnabled: settings.sticksEnabled ?? true,
    letteringOffsetX: settings.letteringOffsetX ?? 0,
    letteringOffsetY: settings.letteringOffsetY ?? 0,
  };
}
