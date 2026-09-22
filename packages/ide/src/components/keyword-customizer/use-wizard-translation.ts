import { useRouter } from "next/router";
import { t } from "@/i18n";

export function useWizardLocale() {
  try {
    return useRouter().locale;
  } catch {
    return undefined;
  }
}

export function useWizardTranslation() {
  const locale = useWizardLocale();
  return (key: string, params?: Parameters<typeof t>[2]) =>
    t(locale, `wizard.${key}`, params);
}
