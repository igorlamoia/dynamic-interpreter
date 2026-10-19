# Atualização dos TCCs em relação ao código

Revisão de 19/10/2026 sobre o código `04adff2`, depois da incorporação de
`main` à branch `escrita-tcc`. A sincronização anterior
([ATUALIZACAO-CODIGO-2026-09-17.md](ATUALIZACAO-CODIGO-2026-09-17.md)) e as
revisões de 19/09 cobriram o código até os commits de 18/09. Esta revisão
trata dos 48 commits de `main` entre 19/09 e 13/10.

## Diferenças incorporadas

| Mudança no código | Atualização nos textos | Evidência principal |
| --- | --- | --- |
| Operadores `++` e `--`, prefixados e pós-fixados | Victor: especificação, análise sintática e código intermediário | `grammar/syntax/updateOperator.ts`, `attributeStmt.ts`, `factorStmt.ts`, `unitaryStmt.ts` |
| Inicializador no fim de uma declaração múltipla vale para as variáveis anteriores | Victor: código intermediário | `grammar/syntax/declarationStmt.ts` |
| Leitura de variável não declarada vira erro | Victor: interpretação | `grammar/syntax/typedIdentifier.ts`, `interpreter/index.ts` |
| Limite de 100.000 passos na execução | Victor: interpretação | `interpreter/index.ts`, `interpreter/constants.ts` |
| Delimitadores de bloco sem exigência de identificador | Victor: tabela de elementos configuráveis e limitação; Igor: trecho `lst:validate-delimiters` | `lexer/config.ts`, `contexts/keyword/keyword-validator.ts` |
| Resumo de regras em `language-rules.ts` | Victor: especificação | `packages/compiler/src/language-rules.ts` |
| `submissions.test_case_results` | Victor: modelagem do banco e dicionário (82 atributos) | `backend/app/models/submission.py`, migração `0a1b2c3d4e5f` |
| Tutoriais guiados | Igor: nova Seção de orientação ao usuário | `lib/tutorials.ts`, `components/tutorial/` |
| Ajuda (exemplo da linguagem) e Regras do compilador no menu | Igor: nova Seção de orientação ao usuário | `views/ide/components/menu.tsx`, `compiler-rules-dialog.tsx` |
| Página Sobre | Igor: nova Seção de orientação ao usuário | `pages/about.tsx` |
| Correção de submissão dentro da IDE | Igor: Subseção de correção pelo professor | `views/submissions/components/submission-ide-panel.tsx` |
| Tradução de listas, exercícios, submissões, linguagens e autenticação | Igor: cobertura 56/180 para 98/187 | `i18n/locales/*` |

## Divergências encontradas no código

- `validateBlockDelimiters` aceita delimitadores como `<:` e `:>`, mas o
  léxico os quebra em `<`, `:` e `:`, `>`. Funcionam as chaves e as
  palavras com forma de identificador. Registrado no texto do Victor como
  limitação.
- O diálogo de regras da IDE tem textos próprios em `i18n/locales/*/compiler-rules.ts`
  e não usa `language-rules.ts`. As regras aparecem sempre com as palavras
  canônicas, qualquer que seja a linguagem ativa.
- `hasCompletedTutorial` não é chamado em nenhum ponto; a conclusão de um
  tutorial é gravada, mas não é usada.
- `components/ui/highlighter.tsx` (rough-notation) não é usado por nenhuma tela.

## Verificações de 19/10/2026

| Escopo | Arquivos | Aprovados | Falhas |
| --- | ---: | ---: | ---: |
| Compilador | 22 | 243 | 0 |
| Back-end | 17 | 188 | 0 |
| IDE (`npm test`) | 60 | 312 | 0 |
| E2E | não executado | | |

Registros: [`victor/verificacao/testes-2026-10-19.json`](victor/verificacao/testes-2026-10-19.json)
e [`igor/verificacao/testes-2026-10-19.json`](igor/verificacao/testes-2026-10-19.json).

## Pendências

- Figuras: `victor/Figuras/validateBlockDelimiter.png` mostra a versão
  anterior da função (o texto avisa). As capturas das telas do professor
  (listas, publicação) são anteriores aos modais refeitos em 04/10, e não há
  capturas dos tutoriais, da página Sobre nem da correção na IDE. O
  `README.MD` de `main` tem capturas novas em `packages/ide/public/readme/`.
- O pacote E2E precisa ser executado de novo com os serviços ativos.
