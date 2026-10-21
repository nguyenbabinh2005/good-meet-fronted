import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const languageOptions = [
  { code: "vi", label: "Tiếng Việt", shortLabel: "VI" },
  { code: "en", label: "English", shortLabel: "EN" },
] as const;

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeLanguage = i18n.resolvedLanguage?.split("-")[0] ?? "en";

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node))
        setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const selectLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      className={isOpen ? "language-switcher is-open" : "language-switcher"}
      ref={switcherRef}
    >
      <button
        aria-expanded={isOpen}
        aria-label={t("common.language")}
        className="language-trigger"
        onClick={() => setIsOpen((open) => !open)}
        ref={triggerRef}
        type="button"
      >
        <span>{activeLanguage.toUpperCase()}</span>
        <ChevronDown
          aria-hidden="true"
          className="language-chevron"
          size={15}
        />
      </button>

      {isOpen && (
        <div className="language-menu">
          {languageOptions.map((option) => {
            const isActive = option.code === activeLanguage;
            return (
              <button
                aria-pressed={isActive}
                className={
                  isActive ? "language-option is-active" : "language-option"
                }
                key={option.code}
                onClick={() => void selectLanguage(option.code)}
                type="button"
              >
                <span className="language-code">{option.shortLabel}</span>
                <span>{option.label}</span>
                {isActive && <Check aria-hidden="true" size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
