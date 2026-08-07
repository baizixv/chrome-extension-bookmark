import { Check, Languages, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LanguagePreference, Messages } from "../i18n";
import styles from "./SettingsMenu.module.css";

interface SettingsMenuProps {
  language: LanguagePreference;
  messages: Messages;
  onLanguageChange: (language: LanguagePreference) => void;
}

export function SettingsMenu({
  language,
  messages,
  onLanguageChange,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const options: Array<{ value: LanguagePreference; label: string }> = [
    { value: "system", label: messages.followSystem },
    { value: "zh-CN", label: messages.simplifiedChinese },
    { value: "en", label: messages.english },
  ];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.trigger}
        type="button"
        aria-label={messages.settings}
        title={messages.settings}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Settings size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <div
          className={styles.panel}
          role="dialog"
          aria-label={messages.settings}
        >
          <div className={styles.heading}>
            <Settings size={15} strokeWidth={1.9} aria-hidden="true" />
            <strong>{messages.settings}</strong>
          </div>
          <div className={styles.settingLabel}>
            <Languages size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>{messages.language}</span>
          </div>
          <div
            className={styles.options}
            role="radiogroup"
            aria-label={messages.language}
          >
            {options.map((option) => {
              const selected = option.value === language;
              return (
                <button
                  className={`${styles.option} ${selected ? styles.selected : ""}`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  key={option.value}
                  onClick={() => {
                    onLanguageChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  <Check size={14} strokeWidth={2.2} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
