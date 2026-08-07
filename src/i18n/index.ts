import type {
  BookmarkNode,
  LanguagePreference,
  LocationDescription,
} from "../domain/types";

export type { LanguagePreference } from "../domain/types";
export type UiLanguage = Exclude<LanguagePreference, "system">;

export interface Messages {
  brandName: string;
  tagline: string;
  settings: string;
  language: string;
  followSystem: string;
  simplifiedChinese: string;
  english: string;
  refresh: string;
  currentPage: string;
  loadingPage: string;
  wait: string;
  noPage: string;
  unnamedPage: string;
  switchPage: string;
  saveLocation: string;
  openManager: string;
  loading: string;
  locationHeading: string;
  saveFolderTop: string;
  insertBefore: string;
  placeAtFolderEnd: string;
  folderEndDetail: string;
  noFolders: string;
  chooseLocation: string;
  unnamedFolder: string;
  unnamedBookmark: string;
  save: string;
  saving: string;
  readFailed: string;
  locationSaveFailed: string;
  pageUnavailable: string;
  movedExisting: string;
  alreadyPositioned: string;
  invalidUrl: string;
  saveFailed: string;
  targetFolder: string;
  bookmarksBar: string;
  otherBookmarks: string;
  mobileBookmarks: string;
  expandFolder: (name: string) => string;
  collapseFolder: (name: string) => string;
  locationTop: (path: string) => string;
  locationBottom: (path: string) => string;
  locationBefore: (path: string, bookmark: string) => string;
  savedTo: (path: string) => string;
}

const zhCN: Messages = {
  brandName: "书签快存",
  tagline: "保存此刻，稍后继续",
  settings: "设置",
  language: "语言",
  followSystem: "跟随系统",
  simplifiedChinese: "简体中文",
  english: "English",
  refresh: "刷新书签文件夹",
  currentPage: "当前页面",
  loadingPage: "正在读取当前页面...",
  wait: "请稍候",
  noPage: "没有可用的当前页面",
  unnamedPage: "未命名页面",
  switchPage: "请切换到普通网页后重试",
  saveLocation: "保存位置",
  openManager: "打开书签管理器",
  loading: "正在读取...",
  locationHeading: "选择文件夹或书签位置",
  saveFolderTop: "保存到此文件夹顶部",
  insertBefore: "插入到此书签之前",
  placeAtFolderEnd: "放在此文件夹末尾",
  folderEndDetail: "排在当前目录最后",
  noFolders: "没有可用的书签文件夹",
  chooseLocation: "请选择保存位置",
  unnamedFolder: "未命名文件夹",
  unnamedBookmark: "未命名书签",
  save: "保存到书签",
  saving: "正在保存...",
  readFailed: "读取书签失败，请刷新后重试",
  locationSaveFailed: "保存位置设置失败",
  pageUnavailable: "当前页面或目标文件夹不可用",
  movedExisting: "已将已有书签移动到新位置",
  alreadyPositioned: "这个书签已经在指定位置",
  invalidUrl: "此页面类型不支持收藏为书签",
  saveFailed: "保存失败，请确认目标位置仍然存在",
  targetFolder: "目标文件夹",
  bookmarksBar: "书签栏",
  otherBookmarks: "其他书签",
  mobileBookmarks: "移动书签",
  expandFolder: (name) => `展开${name}`,
  collapseFolder: (name) => `折叠${name}`,
  locationTop: (path) => `${path} · 顶部`,
  locationBottom: (path) => `${path} · 末尾`,
  locationBefore: (path, bookmark) => `${path} · 在「${bookmark}」之前`,
  savedTo: (path) => `已保存到「${path}」`,
};

const en: Messages = {
  brandName: "Bookmark Quick Save",
  tagline: "Save now, continue later",
  settings: "Settings",
  language: "Language",
  followSystem: "Use system language",
  simplifiedChinese: "简体中文",
  english: "English",
  refresh: "Refresh bookmark folders",
  currentPage: "Current page",
  loadingPage: "Reading current page...",
  wait: "Please wait",
  noPage: "No active page available",
  unnamedPage: "Untitled page",
  switchPage: "Switch to a regular web page and try again",
  saveLocation: "Save location",
  openManager: "Open bookmark manager",
  loading: "Loading...",
  locationHeading: "Choose a folder or bookmark position",
  saveFolderTop: "Save at the top of this folder",
  insertBefore: "Insert before this bookmark",
  placeAtFolderEnd: "Place at the end of this folder",
  folderEndDetail: "Last item in this folder",
  noFolders: "No bookmark folders available",
  chooseLocation: "Choose a save location",
  unnamedFolder: "Untitled folder",
  unnamedBookmark: "Untitled bookmark",
  save: "Save bookmark",
  saving: "Saving...",
  readFailed: "Could not read bookmarks. Refresh and try again.",
  locationSaveFailed: "Could not save the location setting",
  pageUnavailable: "The current page or target folder is unavailable",
  movedExisting: "Moved the existing bookmark to the new position",
  alreadyPositioned: "This bookmark is already in the selected position",
  invalidUrl: "This page type cannot be saved as a bookmark",
  saveFailed: "Could not save. Check that the target location still exists.",
  targetFolder: "target folder",
  bookmarksBar: "Bookmarks Bar",
  otherBookmarks: "Other Bookmarks",
  mobileBookmarks: "Mobile Bookmarks",
  expandFolder: (name) => `Expand ${name}`,
  collapseFolder: (name) => `Collapse ${name}`,
  locationTop: (path) => `${path} · Top`,
  locationBottom: (path) => `${path} · Bottom`,
  locationBefore: (path, bookmark) => `${path} · Before “${bookmark}”`,
  savedTo: (path) => `Saved to “${path}”`,
};

export function resolveLanguage(
  preference: LanguagePreference,
  systemLanguage: string,
): UiLanguage {
  if (preference !== "system") return preference;
  return systemLanguage.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

export function getMessages(language: UiLanguage): Messages {
  return language === "zh-CN" ? zhCN : en;
}

export function formatLocationSummary(
  description: LocationDescription | null,
  messages: Messages,
): string {
  if (!description) return messages.chooseLocation;
  if (description.targetType === "bottom")
    return messages.locationBottom(description.path);
  if (description.targetType === "before") {
    return messages.locationBefore(
      description.path,
      description.bookmarkTitle || messages.unnamedBookmark,
    );
  }
  return messages.locationTop(description.path);
}

export function getLocalizedFolderTitle(
  node: BookmarkNode,
  messages: Messages,
): string {
  const normalizedTitle = (node.title || "").trim().toLowerCase();
  if (
    node.id === "1" ||
    normalizedTitle === "bookmarks bar" ||
    normalizedTitle === "书签栏"
  ) {
    return messages.bookmarksBar;
  }
  if (
    node.id === "2" ||
    normalizedTitle === "other bookmarks" ||
    normalizedTitle === "其他书签"
  ) {
    return messages.otherBookmarks;
  }
  if (
    node.id === "3" ||
    normalizedTitle === "mobile bookmarks" ||
    normalizedTitle === "移动书签"
  ) {
    return messages.mobileBookmarks;
  }
  return node.title || messages.unnamedFolder;
}
