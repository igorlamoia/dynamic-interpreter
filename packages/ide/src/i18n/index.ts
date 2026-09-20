import enFooter from "./locales/en/footer";
import enIde from "./locales/en/ide";
import enLanguageSample from "./locales/en/language-sample";
import enToast from "./locales/en/toast";
import enUi from "./locales/en/ui";
import esFooter from "./locales/es/footer";
import esIde from "./locales/es/ide";
import esLanguageSample from "./locales/es/language-sample";
import esToast from "./locales/es/toast";
import esUi from "./locales/es/ui";
import ptBrFooter from "./locales/pt-BR/footer";
import ptBrIde from "./locales/pt-BR/ide";
import ptBrLanguageSample from "./locales/pt-BR/language-sample";
import ptBrToast from "./locales/pt-BR/toast";
import ptBrUi from "./locales/pt-BR/ui";
import ptPtFooter from "./locales/pt-PT/footer";
import ptPtIde from "./locales/pt-PT/ide";
import ptPtLanguageSample from "./locales/pt-PT/language-sample";
import ptPtToast from "./locales/pt-PT/toast";
import ptPtUi from "./locales/pt-PT/ui";
import enToken from "@ts-compilator-for-java/compiler/src/i18n/locales/en/token";
import esToken from "@ts-compilator-for-java/compiler/src/i18n/locales/es/token";
import ptBrToken from "@ts-compilator-for-java/compiler/src/i18n/locales/pt-BR/token";
import ptPtToken from "@ts-compilator-for-java/compiler/src/i18n/locales/pt-PT/token";
import type { IdeIntl } from "./types/ide";
import type { LanguageSampleIntl } from "./types/language-sample";

export const SUPPORTED_LOCALES = [
  { code: "pt-BR", flag: "🇧🇷" },
  { code: "pt-PT", flag: "🇵🇹" },
  { code: "es", flag: "🇪🇸" },
  { code: "en", flag: "🇺🇸" },
] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]["code"];

const SUPPORTED_LOCALE_CODES = SUPPORTED_LOCALES.map(
  (locale) => locale.code,
) as readonly SupportedLocale[];

type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;
type TranslationNamespace = Record<string, string>;
interface TranslationTree {
  ui: TranslationNamespace;
  toast: TranslationNamespace;
  footer: TranslationNamespace;
  token: TranslationNamespace;
  ide: IdeIntl;
  languageSample: LanguageSampleIntl;
}

const LOCALES: Record<SupportedLocale, TranslationTree> = {
  "pt-BR": {
    ui: ptBrUi,
    toast: ptBrToast,
    footer: ptBrFooter,
    token: ptBrToken,
    ide: ptBrIde,
    languageSample: ptBrLanguageSample,
  },
  "pt-PT": {
    ui: ptPtUi,
    toast: ptPtToast,
    footer: ptPtFooter,
    token: ptPtToken,
    ide: ptPtIde,
    languageSample: ptPtLanguageSample,
  },
  es: {
    ui: esUi,
    toast: esToast,
    footer: esFooter,
    token: esToken,
    ide: esIde,
    languageSample: esLanguageSample,
  },
  en: {
    ui: enUi,
    toast: enToast,
    footer: enFooter,
    token: enToken,
    ide: enIde,
    languageSample: enLanguageSample,
  },
};

export function resolveLocale(locale: string | undefined): SupportedLocale {
  if (!locale) return "pt-BR";
  if ((SUPPORTED_LOCALE_CODES as readonly string[]).includes(locale)) {
    return locale as SupportedLocale;
  }

  const language = locale.toLowerCase();
  if (language.startsWith("pt")) return "pt-BR";
  if (language.startsWith("es")) return "es";
  if (language.startsWith("en")) return "en";
  return "pt-BR";
}

function resolveFromTree(tree: TranslationTree, key: string): string | null {
  const [namespace, ...parts] = key.split(".");
  if (!namespace || parts.length === 0) return null;
  if (namespace === "ide" || namespace === "languageSample") return null;

  const messageKey = parts.join(".");
  const messages =
    tree[
      namespace as keyof Omit<TranslationTree, "ide" | "languageSample">
    ];
  return messages?.[messageKey] ?? null;
}

export function t(
  locale: string | undefined,
  key: string,
  params?: TranslationParams | null,
): string {
  const selected = LOCALES[resolveLocale(locale)];
  const fallback = LOCALES["pt-BR"];
  const template =
    resolveFromTree(selected, key) ?? resolveFromTree(fallback, key) ?? key;

  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, param: string) => {
    const value = params[param];
    return value === undefined || value === null ? `{${param}}` : String(value);
  });
}

export function translateTokenDescription(
  locale: string | undefined,
  tokenName: string,
): string {
  return t(locale, `token.${tokenName}`);
}

export function getIdeIntl(locale: string | undefined): IdeIntl {
  return LOCALES[resolveLocale(locale)].ide;
}

export function getLanguageSampleIntl(
  locale: string | undefined,
): LanguageSampleIntl {
  return LOCALES[resolveLocale(locale)].languageSample;
}
