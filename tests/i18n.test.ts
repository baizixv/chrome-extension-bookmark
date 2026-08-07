import { describe, expect, it } from "vitest";
import {
  formatLocationSummary,
  getLocalizedFolderTitle,
  getMessages,
  resolveLanguage,
} from "../src/i18n";

describe("i18n", () => {
  it("follows Chinese and English system languages", () => {
    expect(resolveLanguage("system", "zh-CN")).toBe("zh-CN");
    expect(resolveLanguage("system", "en-US")).toBe("en");
  });

  it("honors an explicit language preference", () => {
    expect(resolveLanguage("en", "zh-CN")).toBe("en");
    expect(resolveLanguage("zh-CN", "en-US")).toBe("zh-CN");
  });

  it("localizes Chrome root folder names", () => {
    expect(
      getLocalizedFolderTitle(
        { id: "1", title: "Bookmarks Bar" },
        getMessages("zh-CN"),
      ),
    ).toBe("书签栏");
    expect(
      getLocalizedFolderTitle(
        { id: "2", title: "其他书签" },
        getMessages("en"),
      ),
    ).toBe("Other Bookmarks");
  });

  it("formats location summaries in the selected language", () => {
    const description = {
      path: "Bookmarks Bar / Plans",
      targetType: "before" as const,
      bookmarkTitle: "Tego Arc",
    };
    expect(formatLocationSummary(description, getMessages("zh-CN"))).toBe(
      "Bookmarks Bar / Plans · 在「Tego Arc」之前",
    );
    expect(formatLocationSummary(description, getMessages("en"))).toBe(
      "Bookmarks Bar / Plans · Before “Tego Arc”",
    );
  });
});
