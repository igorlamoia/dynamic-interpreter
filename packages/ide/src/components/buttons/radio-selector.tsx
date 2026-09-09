import { RegisterOptions } from "react-hook-form";

type TOption = {
  value: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export function RadioSelector({
  options,
  field,
}: {
  options: TOption[];
  field: RegisterOptions;
}) {
  return options.map(({ value, label, Icon }) => (
    <label key={value} className="flex-1 relative cursor-pointer">
      <input
        className="peer sr-only"
        type="radio"
        value={value}
        checked={field.value === value}
        onChange={() => field.onChange?.(value)}
      />
      <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-slate-400 transition-all peer-checked:bg-white/10 peer-checked:text-primary peer-checked:shadow-sm">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
    </label>
  ));
}
