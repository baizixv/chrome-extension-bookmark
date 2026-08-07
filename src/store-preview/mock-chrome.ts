import type { BookmarkNode } from "../domain/types";

const bookmarkTree: BookmarkNode[] = [
  {
    id: "0",
    title: "",
    children: [
      {
        id: "1",
        title: "Bookmarks Bar",
        children: [
          {
            id: "100",
            title: "Project Roadmap",
            url: "https://example.com/roadmap",
          },
          {
            id: "10",
            title: "Plans",
            children: [
              {
                id: "101",
                title: "Tego Arc",
                url: "https://example.com/tego-arc",
              },
              {
                id: "102",
                title: "Launch Checklist",
                url: "https://example.com/launch",
              },
            ],
          },
          {
            id: "103",
            title: "Design Notes",
            url: "https://example.com/design",
          },
        ],
      },
      {
        id: "2",
        title: "Other Bookmarks",
        children: [
          {
            id: "20",
            title: "Reading List",
            children: [],
          },
        ],
      },
    ],
  },
];

export function installMockChrome(language: "zh-CN" | "en"): void {
  const settings = {
    location: {
      folderId: "1",
      target: { type: "before", bookmarkId: "100" },
    },
    language,
  };
  const mockChrome = {
    i18n: {
      getUILanguage: () => (language === "zh-CN" ? "zh-CN" : "en-US"),
    },
    tabs: {
      query: async () => [
        {
          title:
            language === "zh-CN"
              ? "Tego Arc - 项目规划"
              : "Tego Arc - Project Planning",
          url: "https://example.com/tego-arc",
        },
      ],
      create: async () => undefined,
    },
    bookmarks: {
      getTree: async () => bookmarkTree,
      getChildren: async (folderId: string) => {
        const find = (nodes: BookmarkNode[]): BookmarkNode | undefined => {
          for (const node of nodes) {
            if (node.id === folderId) return node;
            const child = find(node.children || []);
            if (child) return child;
          }
          return undefined;
        };
        return find(bookmarkTree)?.children || [];
      },
      create: async () => undefined,
      move: async () => undefined,
    },
    storage: {
      local: {
        get: async () => settings,
        set: async () => undefined,
        remove: async () => undefined,
      },
    },
  };
  Object.assign(chrome as unknown as Record<string, unknown>, mockChrome);
}
