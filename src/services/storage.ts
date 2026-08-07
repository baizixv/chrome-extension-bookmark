import { migrateSettings } from "../domain/settings";
import type { AppSettings } from "../domain/types";

const LEGACY_KEYS = [
  "folderId",
  "targetId",
  "position",
  "customTargetId",
  "customIndex",
  "avoidDuplicate",
];

export async function loadSettings(): Promise<AppSettings> {
  return migrateSettings(await chrome.storage.local.get());
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await chrome.storage.local.set(settings);
  await chrome.storage.local.remove(LEGACY_KEYS);
}
