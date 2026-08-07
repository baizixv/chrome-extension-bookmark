import { describe, expect, it } from "vitest";
import { migrateSettings } from "../src/domain/settings";

describe("settings migration", () => {
  it("reads the current discriminated location format", () => {
    expect(
      migrateSettings({
        location: {
          folderId: "10",
          target: { type: "before", bookmarkId: "100" },
        },
        language: "en",
      }),
    ).toEqual({
      location: {
        folderId: "10",
        target: { type: "before", bookmarkId: "100" },
      },
      language: "en",
    });
  });

  it("migrates legacy custom targets", () => {
    expect(
      migrateSettings({
        folderId: "10",
        position: "custom",
        customTargetId: "100",
      }),
    ).toEqual({
      location: {
        folderId: "10",
        target: { type: "before", bookmarkId: "100" },
      },
      language: "system",
    });
  });

  it("migrates the merged picker targetId format", () => {
    expect(migrateSettings({ folderId: "10", targetId: "100" })).toEqual({
      location: {
        folderId: "10",
        target: { type: "before", bookmarkId: "100" },
      },
      language: "system",
    });
  });

  it("migrates legacy bottom targets", () => {
    expect(migrateSettings({ folderId: "10", targetId: "bottom" })).toEqual({
      location: { folderId: "10", target: { type: "bottom" } },
      language: "system",
    });
  });
});
