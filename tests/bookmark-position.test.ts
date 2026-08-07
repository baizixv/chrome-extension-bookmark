import { describe, expect, it } from "vitest";
import { getMoveIndex, resolvePosition } from "../src/domain/bookmark-position";
import type { BookmarkNode } from "../src/domain/types";

const children: BookmarkNode[] = [
  { id: "a", title: "A", url: "https://a.example" },
  { id: "b", title: "B", url: "https://b.example" },
  { id: "c", title: "C", url: "https://c.example" },
];

describe("bookmark position", () => {
  it("resolves top, bottom, and before targets", () => {
    expect(resolvePosition(children, { type: "top" }).index).toBe(0);
    expect(resolvePosition(children, { type: "bottom" }).index).toBe(3);
    expect(
      resolvePosition(children, { type: "before", bookmarkId: "b" }).index,
    ).toBe(1);
  });

  it("falls back to top for a missing bookmark target", () => {
    expect(
      resolvePosition(children, { type: "before", bookmarkId: "missing" }),
    ).toEqual({
      index: 0,
      target: { type: "top" },
    });
  });

  it("adjusts the index when moving an earlier duplicate before a later bookmark", () => {
    const position = resolvePosition(children, {
      type: "before",
      bookmarkId: "c",
    });
    expect(getMoveIndex(position, 0, children.length, "a")).toBe(1);
  });

  it("moves duplicates to top and bottom", () => {
    expect(
      getMoveIndex(resolvePosition(children, { type: "top" }), 2, 3, "c"),
    ).toBe(0);
    expect(
      getMoveIndex(resolvePosition(children, { type: "bottom" }), 0, 3, "a"),
    ).toBe(2);
  });

  it("does not move a duplicate relative to itself", () => {
    const position = resolvePosition(children, {
      type: "before",
      bookmarkId: "b",
    });
    expect(getMoveIndex(position, 1, children.length, "b")).toBe(1);
  });
});
