import type { ActivePage } from "../domain/types";

export async function getActivePage(): Promise<ActivePage | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return null;
  return {
    title: tab.title || "",
    url: tab.url || "",
    favIconUrl: tab.favIconUrl,
  };
}

export function getSystemLanguage(): string {
  return chrome.i18n.getUILanguage();
}

export function closePopup(): void {
  window.close();
}

export async function openBookmarkManager(): Promise<void> {
  await chrome.tabs.create({ url: "chrome://bookmarks/" });
}
