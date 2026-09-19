import { expect, type Locator } from "@playwright/test";

/**
 * Preenche um campo e só segue quando o valor realmente ficou nele.
 *
 * O problema que isto resolve é real e já custou duas falhas nesta suíte:
 * entre o HTML chegar e o React hidratar, o campo aceita texto mas o estado
 * ainda não está ligado — na hidratação o input controlado volta ao valor
 * inicial e o que foi digitado some, sem erro nenhum. O teste segue e submete
 * um formulário vazio: no `/login` isso virou "E-mail inválido" e no wizard
 * virou uma linguagem salva sem nome.
 *
 * `fill` sozinho não cobre isso (escreve uma vez) e `toHaveValue` sozinho
 * também não (só observa, não redigita). O `expect.poll` aqui refaz o `fill`
 * a cada tentativa até o valor permanecer — e continua reprovando, com a
 * mensagem abaixo, se o campo estiver de fato quebrado.
 */
export async function preencherEstavel(
  campo: Locator,
  valor: string,
): Promise<void> {
  await expect
    .poll(
      async () => {
        await campo.fill(valor);
        return campo.inputValue();
      },
      { message: `o campo não reteve o valor "${valor}"` },
    )
    .toBe(valor);
}
