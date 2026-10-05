import type { Control, FieldArrayWithId } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { HeroButton } from "@/components/buttons/hero";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/i18n";
import { useRouter } from "next/router";

function splitInputLines(value: string | undefined) {
  const lines = (value ?? "").replace(/\r\n/g, "\n").split("\n");
  return lines.length > 0 ? lines : [""];
}

function replaceLine(lines: string[], lineIndex: number, value: string) {
  return lines
    .map((line, currentIndex) => (currentIndex === lineIndex ? value : line))
    .join("\n");
}

function removeLine(lines: string[], lineIndex: number) {
  return lines
    .filter((_, currentIndex) => currentIndex !== lineIndex)
    .join("\n");
}

function addLineAfter(lines: string[], lineIndex: number) {
  return [
    ...lines.slice(0, lineIndex + 1),
    "",
    ...lines.slice(lineIndex + 1),
  ].join("\n");
}

export function TestCaseFields({
  fields,
  control,
}: {
  fields: FieldArrayWithId[];
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
          data-tour={idx === 0 ? "exercise-test-case" : undefined}
          className="p-3 bg-muted/60 dark:bg-black/20 rounded-lg border border-border dark:border-white/5 space-y-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary">#{idx + 1}</span>
            <FormField
              control={control}
              name={`testCases.${idx}.label`}
              render={({ field: caseField }) => (
                <FormItem className="flex-1">
                  <Input
                    {...caseField}
                    placeholder={t(
                      locale,
                      "ui.dashboard_test_case_name_placeholder",
                    )}
                    className="h-9 text-xs"
                  />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField
              control={control}
              name={`testCases.${idx}.input`}
              render={({ field: caseField }) => (
                <FormItem
                  data-tour={
                    idx === 0 ? "exercise-test-case-stdin" : undefined
                  }
                >
                  <FormLabel className="text-xs normal-case tracking-normal text-muted-foreground">
                    {t(locale, "ui.dashboard_test_case_input_label")}
                  </FormLabel>
                  <div className="space-y-2">
                    {splitInputLines(caseField.value).map(
                      (line, lineIndex, lines) => (
                        <div
                          key={`${caseField.name}-line-${lineIndex}`}
                          className="flex items-center gap-2"
                        >
                          <Input
                            value={line}
                            onChange={(event) =>
                              caseField.onChange(
                                replaceLine(
                                  lines,
                                  lineIndex,
                                  event.target.value,
                                ),
                              )
                            }
                            onBlur={caseField.onBlur}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter") return;
                              event.preventDefault();
                              caseField.onChange(addLineAfter(lines, lineIndex));
                            }}
                            name={`${caseField.name}.${lineIndex}`}
                            aria-label={`${t(
                              locale,
                              "ui.dashboard_test_case_input_label",
                            )} ${lineIndex + 1}`}
                            placeholder={t(
                              locale,
                              "ui.dashboard_test_case_input_placeholder",
                            )}
                            className="h-9 min-w-0 flex-1 text-xs font-mono"
                          />
                          {lines.length > 1 && (
                            <HeroButton
                              type="button"
                              variant="ghost"
                              aria-label={t(
                                locale,
                                "ui.exercises_remove_input",
                              )}
                              onClick={() =>
                                caseField.onChange(removeLine(lines, lineIndex))
                              }
                              className="h-9 w-9 shrink-0 px-0 py-0 text-rose-300 hover:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </HeroButton>
                          )}
                        </div>
                      ),
                    )}
                    <HeroButton
                      type="button"
                      variant="outline"
                      data-tour={idx === 0 ? "exercise-add-stdin" : undefined}
                      onClick={() =>
                        caseField.onChange(`${caseField.value ?? ""}\n`)
                      }
                      className="h-8 px-3 py-1.5 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t(locale, "ui.exercises_add_input")}
                    </HeroButton>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`testCases.${idx}.expectedOutput`}
              render={({ field: caseField }) => (
                <FormItem
                  data-tour={
                    idx === 0 ? "exercise-test-case-output" : undefined
                  }
                >
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
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
