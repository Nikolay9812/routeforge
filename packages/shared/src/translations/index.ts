import type { SupportedLanguage } from "../types";
import { bgTranslations } from "./bg";
import { deTranslations, type TranslationCatalog } from "./de";

export { bgTranslations, deTranslations };
export type { TranslationCatalog };

export const DEFAULT_LANGUAGE = "de" satisfies SupportedLanguage;
export const OPTIONAL_LANGUAGE = "bg" satisfies SupportedLanguage;
export const SUPPORTED_TRANSLATION_LANGUAGES = [
  DEFAULT_LANGUAGE,
  OPTIONAL_LANGUAGE,
] as const satisfies readonly SupportedLanguage[];

export const translations = {
  de: deTranslations,
  bg: bgTranslations,
} satisfies Record<SupportedLanguage, TranslationCatalog>;

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_TRANSLATION_LANGUAGES as readonly string[]).includes(value);
}

export function resolveSupportedLanguage(
  value: string | null | undefined,
): SupportedLanguage {
  return value != null && isSupportedLanguage(value) ? value : DEFAULT_LANGUAGE;
}

export function getTranslations(
  language: SupportedLanguage = DEFAULT_LANGUAGE,
): TranslationCatalog {
  return translations[language];
}
