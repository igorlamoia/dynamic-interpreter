# Atualização dos TCCs em relação ao código

Revisão concluída em 17/09/2026 sobre o código `b4372bf`, após as incorporações
de `main` à branch `escrita-tcc`. A comparação utilizou os conteúdos versionados
nas revisões de Victor (`d15acc1`) e Igor (`62ba7c5`), e não apenas as datas dos
commits: parte das alterações havia sido escrita antes, mas só chegou à branch
com as incorporações posteriores.

## Diferenças incorporadas

| Mudança no código | Atualização nos textos | Evidência principal |
| --- | --- | --- |
| Quatro linguagens prontas e Portugol inicial | Igor: tabela dos modos e seleção local/remota; Victor: relação entre predefinições e variantes do núcleo | `packages/ide/src/lib/default-languages.ts`, `hooks/useLanguageChoices.ts` |
| Linguagem obrigatória com identidade e bloqueio de seleção | Aplicação temporária, precedência exercício/lista e restauração da preferência pessoal | `contexts/keyword/KeywordContext.tsx`, `components/exercise-workspace/workspace-content.tsx` |
| `variable`/`function` como chaves canônicas | Nomenclatura e migração local explicadas; listagem de pré-visualização de Igor corrigida | `packages/compiler/src/token/constants/reserveds.ts`, `KeywordContext.tsx` |
| Reconhecimento de `ç` e `Ç` | Limites do alfabeto explicitados, sem atribuir suporte Unicode irrestrito | `packages/compiler/src/lexer/lexer-helpers.ts`, `lexer/config.ts` |
| Igualdade estrita e comparação comum com coerção | Semântica, identificadores e limites da personalização; distinção de `!=` | `token/constants/relationals.ts`, `interpreter/index.ts`, `interpreter/utils.ts` |
| Expressão ternária | Precedência, aninhamento, tipo resultante e execução somente do ramo escolhido | `packages/compiler/src/grammar/syntax/exprStmt.ts` |
| Validação de atribuições e retornos | Distinção entre avisos na análise e rejeição em execução | `token/TokenIterator.ts`, `interpreter/index.ts` |
| Edição remota de linguagens | Campos `name`/`description`, rota por identificador e carregamento no servidor | `packages/ide/src/features/language-creator/server-props.ts` |
| Criação/substituição de exercício com testes | POST/PUT/PATCH diferenciados e ordenação dos testes | `backend/app/modules/exercises`, `schemas/exercises.py` |
| Resumo de turmas | Professor e contagens de membros/listas nos cartões | `backend/app/modules/classes/service.py` |
| Área de resolução de exercícios | Componentes, código anterior, navegação, reenvio, prazo e painel de resultados | `packages/ide/src/components/exercise-workspace` |
| Saída incremental no terminal e painel lateral ajustável | Junção de fragmentos na depuração e ajuste por ponteiro | `components/terminal/index.tsx`, `views/ide/components/side-explorer/sidebar-panel.tsx` |
| Temas e controles do assistente | Capturas e verificação técnica repetidas sobre o código atual | `igor/verificacao/interface-2026-09-16.json` |

Também foram corrigidas inconsistências encontradas durante a conferência:
execução interativa no navegador (em contraste com a validação no servidor),
atribuição não demonstrada de execução de testes ao fluxo de implantação,
atores visitantes e vinculação de linguagem a listas no diagrama de Victor.
A pré-visualização de código foi descrita como ilustrativa, sem pressupor
compilação automática do trecho produzido.

O gerador do dicionário de dados foi executado novamente e produziu os mesmos
arquivos: continuam sendo onze tabelas, 81 atributos e 21 referências. A mudança
de ordenação do relacionamento de casos de teste foi registrada na metodologia.

## Verificações realizadas em 16/09/2026

| Escopo executado | Arquivos | Aprovados | Falhas |
| --- | ---: | ---: | ---: |
| Núcleo do compilador | 21 | 224 | 0 |
| Configuração de integração da IDE | 28 | 139 | 0 |
| Exemplos adicionais de armazenamento e etapas do assistente | 2 | 6 | 0 |
| Módulos de exercícios e turmas do backend | 2 | 29 | 0 |

Comandos, executados a partir da raiz, salvo a mudança de diretório indicada:

```sh
npm test --workspace=@ts-compilator-for-java/compiler -- --run
NODE_OPTIONS=--no-experimental-webstorage npm test --workspace=@ts-compilator-for-java/ide
NODE_OPTIONS=--no-experimental-webstorage node node_modules/vitest/vitest.mjs run --config qualificacao/igor/scripts/vitest-exemplos.config.mts
cd backend
.venv/bin/python -m pytest tests/test_exercises.py tests/test_classes.py -q
```

O [registro estruturado](verificacao/sincronia-codigo-2026-09-17.json) lista os
arquivos e resultados. A configuração de integração não seleciona todos os
arquivos da IDE; os 29 casos do backend abrangem apenas os dois módulos citados,
com SQLite em memória. Não foram modificados código nem testes da aplicação.

A verificação do assistente repetiu os quatro cenários de tema e largura,
com navegação por Tab/Enter aprovada e sem excesso de largura do documento.
As contagens de contraste e de links sem nome foram atualizadas no texto.
Persistem problemas de acessibilidade; os achados não constituem certificação.
As capturas antigas dos demais fluxos foram identificadas como históricas;
não foram apresentadas como imagens da versão atual.

## PDFs

Ambos foram recompilados e verificados em A4 retrato, mantendo os limites de
margens do modelo. As páginas novas, diagramas e tabelas foram inspecionados
visualmente. O verificador de diagramação confere também textos, imagens e
traços vetoriais, com tolerância de 0,5 ponto PDF para arredondamento e exceção
explícita para a numeração institucional no cabeçalho.

Resultado final: **Igor, 96 páginas; Victor, 84 páginas; nenhuma ocorrência de
objetos fora das margens nas 180 páginas verificadas**. Não houve avisos
`Overfull`, figuras grandes demais ou referências indefinidas na compilação.
