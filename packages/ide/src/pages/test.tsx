import { ScrollStack, ScrollStackItem } from "@/components/ui/scroll-stack";
import { t } from "@/i18n";
import { useRouter } from "next/router";

export default function Test() {
  const { locale } = useRouter();

  return (
    <main className="h-screen bg-slate-950 p-6 text-white">
      <ScrollStack className="h-full ">
        <ScrollStackItem itemClassName="bg-red-400/90 text-slate-950">
          <h2>{t(locale, "ui.test_card_1_title")}</h2>
          <p>{t(locale, "ui.test_card_1_description")}</p>
        </ScrollStackItem>
        <ScrollStackItem itemClassName="bg-blue-400/90 text-slate-950">
          <h2>{t(locale, "ui.test_card_2_title")}</h2>
          <p>{t(locale, "ui.test_card_2_description")}</p>
        </ScrollStackItem>
        <ScrollStackItem itemClassName="bg-green-400/90 text-slate-950">
          <h2>{t(locale, "ui.test_card_3_title")}</h2>
          <p>{t(locale, "ui.test_card_3_description")}</p>
        </ScrollStackItem>
      </ScrollStack>
    </main>
  );
}
