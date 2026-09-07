import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormItem, FormLabel } from "../ui/form";
import { PerfectScrollbar } from "../ui/perfect-scrollbar";
import { OptionCardIcon, OptionCardIconProps } from "./option-card";

export type DocumentedFieldProps = {
  label: string;
  value: string;
  description: string;
  onValueChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  placeholder?: string;
  descriptionPlaceholder?: string;
  disabled?: boolean;
  icon?: OptionCardIconProps;
};

export function DocumentedField({
  label,
  value,
  description,
  onValueChange,
  onDescriptionChange,
  placeholder,
  descriptionPlaceholder = "Descreva como esse item funciona na linguagem.",
  disabled = false,
  icon,
}: DocumentedFieldProps) {
  return (
    <div className="group relative overflow-hidden rounded-md border border-white/8 bg-[#0E1629]/95 p-4 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.98)] backdrop-blur-xl dark:border-white/6 dark:bg-[#0B1020]/96">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,65,100,0.25),rgba(59,65,100,0))] blur-2xl" />
        <div className="absolute -bottom-24 right-0 h-40 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,50,115,0.25),rgba(37,50,115,0))] blur-2xl" />
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <FormItem className="text-left">
          <FormLabel className="flex gap-2 items-center">
            {icon && <OptionCardIcon size="sm" {...icon} />}
            {label}
          </FormLabel>
          <Input
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            disabled={disabled}
            aria-label={label}
          />
        </FormItem>

        <FormItem className="text-left">
          <FormLabel>Descrição</FormLabel>
          <PerfectScrollbar>
            <Textarea
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder={descriptionPlaceholder}
              disabled={disabled}
              aria-label={`${label} descrição`}
            />
          </PerfectScrollbar>
        </FormItem>
      </div>
    </div>
  );
}
