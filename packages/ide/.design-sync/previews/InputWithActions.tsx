import "./_theme";
import { InputWithActions, InputActionButton } from "@ts-compilator-for-java/ide";
import { CaseSensitive, WholeWord, Regex, ReplaceAll, X } from "lucide-react";

export const SearchPanel = () => (
  <div className="flex w-full max-w-sm flex-col gap-2 p-6">
    <InputWithActions
      type="text"
      placeholder="Pesquisar"
      defaultValue="contador"
      actions={
        <>
          <InputActionButton icon={CaseSensitive} active tooltip="Diferenciar maiúsculas" />
          <InputActionButton icon={WholeWord} tooltip="Palavra inteira" />
          <InputActionButton icon={Regex} tooltip="Usar expressão regular" />
        </>
      }
    />
    <InputWithActions
      type="text"
      placeholder="Substituir"
      defaultValue="indice"
      actions={<InputActionButton icon={ReplaceAll} tooltip="Substituir tudo" />}
    />
  </div>
);

export const SingleAction = () => (
  <div className="flex w-full max-w-sm flex-col gap-2 p-6">
    <InputWithActions
      placeholder="Buscar exercício"
      defaultValue="fatorial"
      actions={<InputActionButton icon={X} tooltip="Limpar busca" />}
    />
  </div>
);

export const DisabledAction = () => (
  <div className="flex w-full max-w-sm flex-col gap-2 p-6">
    <InputWithActions
      placeholder="Substituir"
      actions={<InputActionButton icon={ReplaceAll} disabled tooltip="Substituir tudo" />}
    />
  </div>
);
