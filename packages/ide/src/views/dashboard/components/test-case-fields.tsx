import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/i18n";
import { useRouter } from "next/router";

type TestCaseItem = {
  id: string;
  label: string;
  input: string;
  expectedOutput: string;
};

export function TestCaseFields({
  fields,
  control,
}: {
  fields: TestCaseItem[];
  control: Control<any>;
}) {
  const { locale } = useRouter();

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {t(locale, "ui.dashboard_test_cases_help")}
      </p>
      {fields.map((field, idx) => (
        <div
          key={field.id}
          className="p-3 bg-muted/60 dark:bg-black/20 rounded-lg border border-border dark:border-white/5 space-y-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary">#{idx + 1}</span>
            <FormField
              control={control}
              name={`testCases.${idx}.label`}
              render={({ field: caseField }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...caseField}
                      placeholder={t(
                        locale,
                        "ui.dashboard_test_case_name_placeholder",
                      )}
                      className="h-9 text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={control}
              name={`testCases.${idx}.input`}
              render={({ field: caseField }) => (
                <FormItem>
                  <FormLabel className="text-xs normal-case tracking-normal text-muted-foreground">
                    {t(locale, "ui.dashboard_test_case_input_label")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...caseField}
                      rows={3}
                      placeholder={t(
                        locale,
                        "ui.dashboard_test_case_input_placeholder",
                      )}
                      className="text-xs font-mono focus:border-primary/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`testCases.${idx}.expectedOutput`}
              render={({ field: caseField }) => (
                <FormItem>
                  <FormLabel className="text-xs normal-case tracking-normal text-muted-foreground">
                    {t(locale, "ui.dashboard_test_case_output_label")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...caseField}
                      rows={3}
                      placeholder={t(
                        locale,
                        "ui.dashboard_test_case_output_placeholder",
                      )}
                      className="text-xs font-mono focus:border-primary/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
