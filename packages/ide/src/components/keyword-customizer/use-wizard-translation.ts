import { useRouter } from "next/router";
import { t } from "@/i18n";

export function useWizardTranslation() {
  const { locale } = useRouter();

  return (key: string, params?: Parameters<typeof t>[2]) =>
    t(locale, `wizard.${key}`, params);
}
