import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsMenu } from "../src/components/SettingsMenu";
import { getMessages } from "../src/i18n";

describe("SettingsMenu", () => {
  it("opens from the settings button and selects a language", () => {
    const onLanguageChange = vi.fn();
    render(
      <SettingsMenu
        language="system"
        messages={getMessages("zh-CN")}
        onLanguageChange={onLanguageChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));
    expect(screen.getByRole("dialog", { name: "设置" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "跟随系统" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    fireEvent.click(screen.getByRole("radio", { name: "English" }));
    expect(onLanguageChange).toHaveBeenCalledWith("en");
    expect(
      screen.queryByRole("dialog", { name: "设置" }),
    ).not.toBeInTheDocument();
  });
});
