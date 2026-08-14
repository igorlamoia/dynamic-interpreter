import type { LanguagePolicy } from "@/types/api";

export type LanguagePolicyValue = {
  policy: LanguagePolicy;
  lockedLanguageId: number | null;
};

type LanguagePolicyFieldProps = {
  value: LanguagePolicyValue;
  onChange: (next: LanguagePolicyValue) => void;
  languages: { id: number; name: string }[];
  disabled?: boolean;
};

export function LanguagePolicyField({
  value,
  onChange,
  languages,
  disabled = false,
}: LanguagePolicyFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            aria-label="Aberto"
            checked={value.policy === "OPEN"}
            disabled={disabled}
            onChange={() => onChange({ policy: "OPEN", lockedLanguageId: null })}
          />
          Aberto (aluno usa sua linguagem)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            aria-label="Travado"
            checked={value.policy === "LOCKED"}
            disabled={disabled}
            onChange={() =>
              onChange({
                policy: "LOCKED",
                lockedLanguageId: value.lockedLanguageId,
              })
            }
          />
          Travado em uma linguagem
        </label>
      </div>

      {value.policy === "LOCKED" && (
        <select
          aria-label="Linguagem"
          className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-slate-100"
          value={value.lockedLanguageId ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({
              policy: "LOCKED",
              lockedLanguageId: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">— selecione —</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
