# Verificação técnica de 12/09/2026

Base do código: commit `d15acc103d39ea3031f1bec2f4d6323eaee75155`, branch `escrita-tcc`. As alterações desta revisão atingem os documentos, imagens e scripts de verificação do Igor. Não houve mudança no código da aplicação.

## Interface

A rota `/language-creator` foi aberta localmente, sem autenticação ou consulta a contas reais. O script percorre a primeira e a segunda etapas por teclado, retorna à primeira e executa axe. São quatro cenários: 1440×1000 e 390×844 pixels CSS, temas claro e escuro. O movimento reduzido é solicitado ao navegador; o portal de ferramentas de desenvolvimento do Next.js é ocultado e excluído da análise.

- Chromium: `153.0.8010.12`.
- Playwright: `1.63.0`.
- axe-core: `4.13.0`.
- Regras selecionadas: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.
- Resultado estruturado: [interface-2026-09-12.json](interface-2026-09-12.json).
- Capturas no tema escuro: [computador](../Figuras/wizard-desktop-atual.png), [celular](../Figuras/wizard-mobile-atual.png).
- Capturas no tema claro: [computador](wizard-light-1440.png), [celular](wizard-light-390.png).

A transição de etapas por Tab/Enter funcionou nos quatro cenários. O documento não apresentou largura de rolagem maior que a janela nesses estados. O axe reportou problemas em sete categorias no conjunto dos cenários, incluindo contraste, nomes de controles, título, aninhamento interativo e acesso por teclado a regiões roláveis. Os itens inconclusivos requerem revisão manual. Esses resultados não comprovam conformidade WCAG nem substituem avaliação com leitor de tela ou dos demais fluxos.

Para repetir, a partir da raiz do repositório:

```sh
npm exec --workspace=@ts-compilator-for-java/ide -- next dev -p 3012
```

Em outro terminal, instale as ferramentas em um diretório temporário e execute o script. As versões efetivamente utilizadas estão em `ambiente.json`.

```sh
npm install --prefix /tmp/tcc-igor-browser --no-audit --no-fund playwright@1.63.0 @axe-core/playwright@4.13.0
node /tmp/tcc-igor-browser/node_modules/playwright/cli.js install chromium
NODE_PATH=/tmp/tcc-igor-browser/node_modules node qualificacao/igor/scripts/verificar-interface.cjs http://localhost:3012 /tmp/tcc-igor-interface
```

O script grava capturas e JSON no diretório de saída. As verificações de teclado interrompem a execução se o fluxo esperado não funcionar; violações do axe são registradas como resultados, sem transformar sua presença em aprovação de acessibilidade. O ambiente de desenvolvimento foi iniciado com o Turbopack padrão: a tentativa com `--webpack` falhou ao interpretar um módulo TypeScript do pacote compiler e não gerou evidências da interface.

## Testes da IDE

`npm test --workspace=@ts-compilator-for-java/ide`: **120 testes aprovados em 27 arquivos**. A configuração `vitest.integration.config.ts` seleciona apenas parte dos testes existentes.

Foram executados separadamente `src/lib/keyword-language-storage.spec.ts` e `src/components/keyword-customizer/wizard-stepper.spec.tsx`: **6 testes aprovados em 2 arquivos**. A [configuração dos exemplos](../scripts/vitest-exemplos.config.mts) estende os aliases e o ambiente da configuração de integração, substituindo `test.include` por esses dois caminhos e fixando `root` em `packages/ide`.

```sh
NODE_OPTIONS=--no-experimental-webstorage node node_modules/vitest/vitest.mjs run --config qualificacao/igor/scripts/vitest-exemplos.config.mts
```

No Node.js 25.2.1, a primeira tentativa dos cinco casos de armazenamento falhou no `beforeEach` com `localStorage.clear is not a function`. O comando final usou `NODE_OPTIONS=--no-experimental-webstorage`, para que os processos de teste utilizassem o armazenamento do jsdom. Não foram alterados os testes nem a implementação da aplicação. Os comandos e suas saídas resumidas estão documentados no TCC; a contagem de 120 não inclui esses seis casos adicionais.
