import { describe, expect, it } from "vitest";
import {
  flattenFolders,
  getDefaultLocation,
  getLocationDescription,
  indexBookmarks,
  isBookmarksBar,
  validateLocation,
} from "../src/domain/bookmark-tree";
import type { BookmarkNode } from "../src/domain/types";

const root: BookmarkNode = {
  id: "0",
  title: "",
  children: [
    {
      id: "1",
      title: "Bookmarks Bar",
      children: [
        {
          id: "10",
          title: "Plans",
          children: [
            { id: "100", title: "Tego Arc", url: "https://example.com" },
          ],
        },
      ],
    },
    { id: "2", title: "Other Bookmarks", children: [] },
  ],
};

describe("bookmark tree", () => {
  it.each(["Bookmarks Bar", "Bookmarks bar", "bookmarks bar", "书签栏"])(
    "recognizes the bookmarks bar title %s",
    (title) => expect(isBookmarksBar({ id: "9", title })).toBe(true),
  );

  it("uses Chrome root id 1 as a bookmarks bar fallback", () => {
    expect(isBookmarksBar({ id: "1", title: "Favorites" })).toBe(true);
  });

  it("defaults to the top of Bookmarks Bar", () => {
    expect(getDefaultLocation(root)).toEqual({
      folderId: "1",
      target: { type: "top" },
    });
  });

  it("builds folder paths and bookmark summaries", () => {
    const folders = flattenFolders(root);
    const references = indexBookmarks(root);
    expect(folders.find((folder) => folder.id === "10")?.path).toBe(
      "Bookmarks Bar / Plans",
    );
    expect(
      getLocationDescription(folders, references, {
        folderId: "10",
        target: { type: "before", bookmarkId: "100" },
      }),
    ).toEqual({
      path: "Bookmarks Bar / Plans",
      targetType: "before",
      bookmarkTitle: "Tego Arc",
    });
  });

  it("falls back to folder top when a target bookmark disappears", () => {
    expect(
      validateLocation(root, {
        folderId: "10",
        target: { type: "before", bookmarkId: "missing" },
      }),
    ).toEqual({ folderId: "10", target: { type: "top" } });
  });
});
