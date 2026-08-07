import type {
  BookmarkLocation,
  BookmarkNode,
  BookmarkReference,
  FolderInfo,
  LocationDescription,
} from "./types";

export type FolderTitleResolver = (node: BookmarkNode) => string;

export function getFolderTitle(node: BookmarkNode): string {
  return node.title || "Untitled folder";
}

export function isBookmarksBar(
  node: Pick<BookmarkNode, "id" | "title">,
): boolean {
  const normalizedTitle = (node.title || "").trim().toLowerCase();
  return (
    node.id === "1" ||
    normalizedTitle === "bookmarks bar" ||
    normalizedTitle === "书签栏"
  );
}

export function flattenFolders(
  node: BookmarkNode,
  parentPath: string[] = [],
  getTitle: FolderTitleResolver = getFolderTitle,
): FolderInfo[] {
  const result: FolderInfo[] = [];
  if (!node.url && node.id !== "0") {
    const title = getTitle(node);
    const path = [...parentPath, title];
    result.push({ id: node.id, title, path: path.join(" / ") });
    for (const child of node.children || []) {
      result.push(...flattenFolders(child, path, getTitle));
    }
  } else {
    for (const child of node.children || []) {
      result.push(...flattenFolders(child, parentPath, getTitle));
    }
  }
  return result;
}

export function findNode(node: BookmarkNode, id: string): BookmarkNode | null {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const match = findNode(child, id);
    if (match) return match;
  }
  return null;
}

export function indexBookmarks(
  node: BookmarkNode,
  references: Map<string, BookmarkReference> = new Map(),
): Map<string, BookmarkReference> {
  if (node.url) return references;
  for (const child of node.children || []) {
    if (child.url) {
      references.set(child.id, {
        folderId: node.id,
        title: child.title || "",
      });
    } else {
      indexBookmarks(child, references);
    }
  }
  return references;
}

export function getDefaultLocation(root: BookmarkNode): BookmarkLocation {
  const folders = flattenFolders(root);
  const bookmarksBar = folders.find(isBookmarksBar);
  return {
    folderId: bookmarksBar?.id || folders[0]?.id || "",
    target: { type: "top" },
  };
}

export function validateLocation(
  root: BookmarkNode,
  location: BookmarkLocation,
): BookmarkLocation {
  const folder = findNode(root, location.folderId);
  if (!folder || folder.url) return getDefaultLocation(root);
  if (location.target.type !== "before") return location;
  const bookmarkId = location.target.bookmarkId;
  const targetExists = folder.children?.some(
    (child) => Boolean(child.url) && child.id === bookmarkId,
  );
  return targetExists
    ? location
    : { folderId: location.folderId, target: { type: "top" } };
}

export function getLocationDescription(
  folders: FolderInfo[],
  references: Map<string, BookmarkReference>,
  location: BookmarkLocation,
): LocationDescription | null {
  const folder = folders.find((item) => item.id === location.folderId);
  if (!folder) return null;
  if (location.target.type !== "before") {
    return { path: folder.path, targetType: location.target.type };
  }
  const bookmark = references.get(location.target.bookmarkId);
  return {
    path: folder.path,
    targetType: bookmark ? "before" : "top",
    bookmarkTitle: bookmark?.title,
  };
}
