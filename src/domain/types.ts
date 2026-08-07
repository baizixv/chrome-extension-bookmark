export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

export interface ActivePage {
  title: string;
  url: string;
  favIconUrl?: string;
}

export interface FolderInfo {
  id: string;
  title: string;
  path: string;
}

export type LocationTarget =
  { type: "top" } | { type: "bottom" } | { type: "before"; bookmarkId: string };

export interface BookmarkLocation {
  folderId: string;
  target: LocationTarget;
}

export type LanguagePreference = "system" | "zh-CN" | "en";

export interface AppSettings {
  location: BookmarkLocation;
  language: LanguagePreference;
}

export interface BookmarkReference {
  folderId: string;
  title: string;
}

export interface LocationDescription {
  path: string;
  targetType: LocationTarget["type"];
  bookmarkTitle?: string;
}
