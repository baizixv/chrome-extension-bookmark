import type { BookmarkLocation, BookmarkNode, LocationTarget } from "./types";

export interface ResolvedPosition {
  index: number;
  target: LocationTarget;
}

export function resolvePosition(
  children: BookmarkNode[],
  target: LocationTarget,
): ResolvedPosition {
  if (target.type === "bottom") return { index: children.length, target };
  if (target.type === "top") return { index: 0, target };
  const targetIndex = children.findIndex(
    (child) => Boolean(child.url) && child.id === target.bookmarkId,
  );
  return targetIndex >= 0
    ? { index: targetIndex, target }
    : { index: 0, target: { type: "top" } };
}

export function findDuplicate(
  children: BookmarkNode[],
  url: string,
): BookmarkNode | undefined {
  return children.find((bookmark) => bookmark.url === url);
}

export function getMoveIndex(
  position: ResolvedPosition,
  existingIndex: number,
  childCount: number,
  existingId: string,
): number {
  if (childCount <= 1) return 0;
  if (position.target.type === "bottom") return childCount - 1;

  const desiredIndex = Math.min(Math.max(position.index, 0), childCount - 1);
  const targetIsAnotherBookmark =
    position.target.type === "before" &&
    position.target.bookmarkId !== existingId;
  return targetIsAnotherBookmark && existingIndex < desiredIndex
    ? desiredIndex - 1
    : desiredIndex;
}

export function withResolvedTarget(
  location: BookmarkLocation,
  position: ResolvedPosition,
): BookmarkLocation {
  return position.target === location.target
    ? location
    : { ...location, target: position.target };
}
