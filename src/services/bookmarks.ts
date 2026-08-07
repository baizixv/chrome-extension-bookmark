import type { ActivePage, BookmarkNode } from "../domain/types";

export async function getBookmarkTree(): Promise<BookmarkNode[]> {
  return chrome.bookmarks.getTree();
}

export async function getFolderChildren(
  folderId: string,
): Promise<BookmarkNode[]> {
  return chrome.bookmarks.getChildren(folderId);
}

export async function createPageBookmark(
  folderId: string,
  index: number,
  page: ActivePage,
): Promise<void> {
  await chrome.bookmarks.create({
    parentId: folderId,
    index,
    title: page.title || page.url,
    url: page.url,
  });
}

export async function moveBookmark(
  bookmarkId: string,
  folderId: string,
  index: number,
): Promise<void> {
  await chrome.bookmarks.move(bookmarkId, { parentId: folderId, index });
}
