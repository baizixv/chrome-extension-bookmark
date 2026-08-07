import type {
  BookmarkLocation,
  BookmarkNode,
  BookmarkReference,
  FolderInfo,
} from "./types";

const ROOT_LABELS: Record<string, string> = {
  "Bookmarks bar": "书签栏",
  "Other bookmarks": "其他书签",
  "Mobile bookmarks": "移动书签",
};

export function getFolderTitle(node: BookmarkNode): string {
  return ROOT_LABELS[node.title] || node.title || "未命名文件夹";
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
): FolderInfo[] {
  const result: FolderInfo[] = [];
  if (!node.url && node.id !== "0") {
    const title = getFolderTitle(node);
    const path = [...parentPath, title];
    result.push({ id: node.id, title, path: path.join(" / ") });
    for (const child of node.children || []) {
      result.push(...flattenFolders(child, path));
    }
  } else {
    for (const child of node.children || []) {
      result.push(...flattenFolders(child, parentPath));
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
        title: child.title || "未命名书签",
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

export function getLocationSummary(
  folders: FolderInfo[],
  references: Map<string, BookmarkReference>,
  location: BookmarkLocation,
): string {
  const folder = folders.find((item) => item.id === location.folderId);
  if (!folder) return "请选择保存位置";
  if (location.target.type === "top") return `${folder.path} · 顶部`;
  if (location.target.type === "bottom") return `${folder.path} · 末尾`;
  const bookmark = references.get(location.target.bookmarkId);
  return bookmark
    ? `${folder.path} · 在「${bookmark.title}」之前`
    : `${folder.path} · 顶部`;
}
