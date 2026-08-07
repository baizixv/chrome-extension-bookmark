import type { ActivePage } from "../domain/types";

export async function getActivePage(): Promise<ActivePage | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return null;
  return {
    title: tab.title || "未命名页面",
    url: tab.url || "",
    favIconUrl: tab.favIconUrl,
  };
}

export async function openBookmarkManager(): Promise<void> {
  await chrome.tabs.create({ url: "chrome://bookmarks/" });
}
