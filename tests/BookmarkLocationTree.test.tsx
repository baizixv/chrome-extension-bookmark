import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookmarkLocationTree } from "../src/components/BookmarkLocationTree";
import type { BookmarkNode } from "../src/domain/types";
import { getMessages } from "../src/i18n";

const messages = getMessages("zh-CN");

const root: BookmarkNode = {
  id: "0",
  title: "",
  children: [
    {
      id: "1",
      title: "Bookmarks Bar",
      children: [
        { id: "100", title: "Tego Arc", url: "https://example.com" },
        {
          id: "10",
          title: "Plans",
          children: [
            { id: "101", title: "Roadmap", url: "https://roadmap.example" },
          ],
        },
      ],
    },
    { id: "2", title: "Other Bookmarks", children: [] },
  ],
};

describe("BookmarkLocationTree", () => {
  it("shows Bookmarks Bar children when it is expanded", () => {
    render(
      <BookmarkLocationTree
        root={root}
        location={{ folderId: "1", target: { type: "top" } }}
        summary="Bookmarks Bar · 顶部"
        messages={messages}
        expandedFolderIds={new Set(["1"])}
        onSelect={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Tego Arc")).toBeInTheDocument();
    expect(screen.queryByText("Roadmap")).not.toBeInTheDocument();
  });

  it("selects the parent folder and before target when a bookmark is clicked", () => {
    const onSelect = vi.fn();
    render(
      <BookmarkLocationTree
        root={root}
        location={{ folderId: "1", target: { type: "top" } }}
        summary="Bookmarks Bar · 顶部"
        messages={messages}
        expandedFolderIds={new Set(["1"])}
        onSelect={onSelect}
        onToggle={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("treeitem", { name: /Tego Arc/ }));
    expect(onSelect).toHaveBeenCalledWith({
      folderId: "1",
      target: { type: "before", bookmarkId: "100" },
    });
  });

  it("selects a folder on click and toggles it on double click", () => {
    const onSelect = vi.fn();
    const onToggle = vi.fn();
    render(
      <BookmarkLocationTree
        root={root}
        location={{ folderId: "1", target: { type: "top" } }}
        summary="Bookmarks Bar · 顶部"
        messages={messages}
        expandedFolderIds={new Set(["1"])}
        onSelect={onSelect}
        onToggle={onToggle}
      />,
    );

    const plans = screen.getByRole("treeitem", { name: /Plans/ });
    fireEvent.click(plans);
    expect(onSelect).toHaveBeenCalledWith({
      folderId: "10",
      target: { type: "top" },
    });

    fireEvent.doubleClick(plans);
    expect(onToggle).toHaveBeenCalledWith("10");
  });

  it("uses a dedicated toggle action for nested folders", () => {
    const onToggle = vi.fn();
    render(
      <BookmarkLocationTree
        root={root}
        location={{ folderId: "1", target: { type: "top" } }}
        summary="Bookmarks Bar · 顶部"
        messages={messages}
        expandedFolderIds={new Set(["1"])}
        onSelect={vi.fn()}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "展开Plans" }));
    expect(onToggle).toHaveBeenCalledWith("10");
  });
});
