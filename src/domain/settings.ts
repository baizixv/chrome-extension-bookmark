import type { AppSettings, BookmarkLocation, LocationTarget } from "./types";

const DEFAULT_SETTINGS: AppSettings = {
  location: { folderId: "", target: { type: "top" } },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTarget(value: unknown): LocationTarget | null {
  if (!isRecord(value)) return null;
  if (value.type === "top" || value.type === "bottom")
    return { type: value.type };
  if (value.type === "before" && typeof value.bookmarkId === "string") {
    return { type: "before", bookmarkId: value.bookmarkId };
  }
  return null;
}

function parseCurrentLocation(value: unknown): BookmarkLocation | null {
  if (!isRecord(value) || typeof value.folderId !== "string") return null;
  const target = parseTarget(value.target);
  return target ? { folderId: value.folderId, target } : null;
}

function migrateLegacyTarget(raw: Record<string, unknown>): LocationTarget {
  if (typeof raw.targetId === "string") {
    if (raw.targetId === "top" || raw.targetId === "bottom")
      return { type: raw.targetId };
    return { type: "before", bookmarkId: raw.targetId };
  }
  if (raw.position === "bottom") return { type: "bottom" };
  const legacyTarget =
    typeof raw.customTargetId === "string" ? raw.customTargetId : "top";
  if (
    raw.position === "custom" &&
    legacyTarget !== "top" &&
    legacyTarget !== "bottom"
  ) {
    return { type: "before", bookmarkId: legacyTarget };
  }
  return { type: "top" };
}

export function migrateSettings(raw: unknown): AppSettings {
  if (!isRecord(raw)) return DEFAULT_SETTINGS;
  const currentLocation = parseCurrentLocation(raw.location);
  if (currentLocation) return { location: currentLocation };
  return {
    location: {
      folderId: typeof raw.folderId === "string" ? raw.folderId : "",
      target: migrateLegacyTarget(raw),
    },
  };
}
