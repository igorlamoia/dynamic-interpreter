# Correções da banca — texto do Victor

Data da revisão: 09/09/2026.

Fonte: `ajuste.pdf`, 65 páginas, 38 anotações (incluindo uma marcação sem comentário). As páginas abaixo contam a capa, não a numeração impressa.

Base editada: `qualificacao/victor/`. Os arquivos do Igor e a cópia em `tcc/victor/` não integram esta rodada. Os apontamentos que remetem genericamente ao texto do Igor não foram incorporados como um novo lote de correções.

## Situação dos apontamentos

| Anotação | Página | Cobrança | Situação |
|---|---|---|---|
| 01 | 1 | Justificar “dinâmico” | Ajustado na introdução, resumos e delimitação: configuração lexical e seleção de variantes predefinidas; sem inclusão arbitrária de produções. Conferido em `LexerConfig`, `GrammarConfig` e no analisador. |
| 02 | 3 | Espaço antes dos dois-pontos | Corrigido por ajuste local no preâmbulo, preservando a classe do modelo. |
| 03–04 | 5 | Objetivo individual e projeto completo | Resumo PT revisado e abstract EN sincronizado com o recorte e as limitações. |
| 05 | 8 | Margem na lista de tabelas | Correção anterior preservada; compilação final sem estouros de caixa. |
| 06 | 9 | Engenharia de Software dentro de Compiladores | Estrutura corrigida anteriormente e preservada. |
| 07 | 11 | Citações no local de uso | Parágrafo de atribuição genérica já removido; referências mantidas nos argumentos utilizados. |
| 08 | 11 | Quantificar “altos índices” | Generalização removida. O texto agora delimita dificuldades discutidas na literatura, sem inventar percentuais ou taxas locais. |
| 09 | 11 | Exemplos de linguagens comerciais | Incluídos C, C++ e Java, com explicação das convenções sintáticas. |
| 10 | 11 | Benefício pedagógico ainda não demonstrado | Removidas as afirmações de redução comprovada de carga cognitiva e de suavização da aprendizagem no fechamento da comparação. Hipótese e resultado técnico foram diferenciados. |
| 11 | 11 | Compilador ou interpretador | Definidos compilação para instruções intermediárias, execução pelo interpretador e o termo abrangente “núcleo de tradução e execução”. |
| 12 | 12 | Portugol não depende de língua estrangeira | Argumento reformulado: tradução, programação por blocos e configuração de vocabulário são abordagens distintas. |
| 13 | 12 | Referências para Portugol e Scratch | Acrescentadas citações junto às afirmações e consultadas fontes dos próprios projetos. |
| 14 | 12 | “A grande maioria” | Generalização removida; comparação limitada ao conjunto selecionado. |
| 15 | 12 | Exemplos de linguagens e juízes | Incluídos C++, Java e Python, com referência à documentação do Beecrowd; retirada a afirmação genérica sobre exigências do mercado. |
| 16 | 12 | Objetivo “Estudar” | Já substituído anteriormente por objetivos de construção e verificação. |
| 17 | 14 | Incorporar todos os pontos do Igor | Fora desta rodada, por instrução do autor. |
| 18 | 39 | Mês 08 vazio | **Pendente:** falta informação dos autores sobre a atividade prevista/realizada nesse mês. Nenhum “X” foi inventado. |
| 19 | 39 | Diagrama de casos de uso | Artefato existente preservado. Esta rodada não reaudita a cobertura funcional do diagrama herdado das correções anteriores. |
| 20 | 39 | Cronograma divergente das etapas | Rótulos alinhados: requisitos e elementos configuráveis; geração e execução de código; testes automatizados e definição do protocolo. Retirada da tabela a coleta com usuários, que o texto remete a trabalho futuro. Distribuição mensal ainda depende do fechamento do item 18. |
| 21 | 40 | Identificar os capítulos | Referências explícitas ao capítulo de metodologia, às seções do núcleo e integração e ao apêndice de responsabilidades. |
| 22 | 40 | “Interpretador?!” | Padronizado o recorte como núcleo de tradução e execução, com definição na introdução. |
| 23 | 41 | Teste antes da implementação | Sequência teste que falha → implementação → refatoração explicitada na abertura da metodologia. Isso descreve o método declarado; a existência de testes não comprova a ordem histórica de cada alteração. |
| 24–27 | 41 | Práticas adotadas, Scrum e duração dos ciclos | Descrição anterior de práticas de XP e ausência de ciclos de duração fixa preservada. A anotação 25 não contém comentário independente. |
| 28 | 41 | Organização da metodologia | Parágrafo de organização atualizado após mover a seleção para o referencial. |
| 29–31 | 41 | Critérios de seleção e referências | Critérios explicitados e aplicados a cada ferramenta; fontes citadas junto às justificativas. Ausência de revisão sistemática declarada, sem inventar universo de candidatos ou contagem de exclusões. |
| 32 | 41 | Mover seleção para Trabalhos Relacionados | Seção movida para o referencial, preservando o identificador das referências cruzadas. |
| 33 | 42 | Comentários sobre arquitetura do Igor | O lote externo não foi incorporado. A arquitetura do Victor foi atualizada diretamente a partir do código para corrigir as contradições identificadas na auditoria: navegador, servidor Next.js e serviço FastAPI. |
| 34 | 45 | Banco completo no TCC II | Figura substituída e dicionário incluído: 11 tabelas, 81 atributos e 21 FKs dos modelos SQLAlchemy. Inclui linguagens, configuração nas submissões, políticas de linguagem, nulabilidade e distinção entre restrições SQL e relações ORM. |
| 35 | 57 | “Verificação” em lugar de “validação” | Corrigido na abertura da seção de testes. |
| 36 | 57 | Apresentar pirâmide de testes | Conceito e referência cruzada existentes preservados. |
| 37 | 57 | Divergência sobre Vitest na apresentação | Uso atual documentado por dependência, importações e execução real da suíte. **Pendente:** esclarecimento do autor sobre a afirmação feita durante a apresentação; não foi inventada uma cronologia de adoção. |
| 38 | 59 | Correções bibliográficas conforme Igor | Lote externo fora do escopo. Foram atualizadas apenas as fontes consultadas ou necessárias às correções realizadas aqui. |

## Evidências técnicas

- `packages/ide/src/hooks/useLexerAnalyse.ts`: instancia o analisador no navegador.
- `packages/ide/src/hooks/useIntermediatorCode.ts`: gera instruções no navegador.
- `packages/ide/src/components/terminal/body.tsx`: instancia e executa o interpretador no terminal.
- `packages/ide/src/hooks/useDebugSession.ts`: reutiliza o núcleo para depuração.
- `packages/ide/src/pages/api/submissions/validate.ts`: traduz uma vez, executa os casos de teste e solicita o registro da submissão; a simulação `dryRun` dispensa o registro.
- `packages/compiler/src/token/TokenIterator.ts`: declara `GrammarConfig` e seus modos de terminador, blocos, tipagem e arranjos.
- `backend/app/models`: origem das tabelas, atributos e restrições. Não houve consulta ou alteração de banco de produção.

Para regenerar a figura do esquema e o dicionário a partir dos modelos:

```sh
backend/.venv/bin/python qualificacao/victor/scripts/gerar-dicionario-dados.py
```

O script documenta os metadados sem abrir uma conexão com o banco. Um acréscimo de tabela exige atualizar também o layout explícito da figura.

## Fontes consultadas

As datas de acesso foram atualizadas apenas para os documentos efetivamente consultados nesta rodada. Datas antigas de outras entradas não foram presumidas nem substituídas em massa.

- [Portugol Studio — página do projeto](https://univali-lite.github.io/Portugol-Studio/): linguagem em português, depuração e inspeção de variáveis.
- [Scratch Foundation — Getting Started](https://scratchfoundation.org/learn/learning-library/getting-started): iniciação e programação por blocos.
- [Beecrowd — FAQs Problems](https://judge.beecrowd.com/en/faqs/about/problems): exemplos em C++, Java e Python e tratamento de entrada e saída.
- [Laila — documento no IFCE](https://gestaoaracati.ifce.edu.br/attachments/download/2699/tcc.pdf): título, autores e construção de analisadores web com FLEX e Bison; a entrada bibliográfica foi corrigida para o documento consultado.
- [chibicc — repositório do autor](https://github.com/rui314/chibicc): construção incremental de um compilador C.
- [Quorum — página do projeto](https://quorumlanguage.com/): recursos e finalidade da linguagem.
- [Registro institucional USP de Souza, Batista e Barbosa](https://repositorio.usp.br/item/002782533): identificação do mapeamento sistemático já citado. O acesso direto ao artigo pela URL histórica não foi concluído; nenhum percentual novo de reprovação foi extraído ou atribuído a ele.

## Verificação

- Suíte do núcleo executada em 09/09/2026 com Vitest: **215 testes aprovados em 21 arquivos**, sem falhas. O apêndice apresentava 22 arquivos, embora as linhas da própria tabela somassem 21; corrigido.
- Grupos: tokens 8; análise léxica 56; análise sintática/semântica 138; interpretação 13.
- PDF revisado com 81 páginas, compilado por `latexmk` e BibTeX, sem referências indefinidas, citações indefinidas, caixas excedentes ou figuras maiores que a página. Inspeção visual do título, arquitetura, esquema, figura de validação e dicionário. `git diff --check` sem erros.
- Os arquivos auxiliares da compilação foram mantidos em `/tmp/tcc-victor-build`; o PDF revisado é `TCC_Template.pdf` nesta pasta.

## Pendências dependentes dos autores

1. Informar a atividade do mês 08 e confirmar a distribuição mensal do cronograma.
2. Esclarecer a afirmação sobre não ter utilizado Vitest durante a apresentação, distinguindo o que foi demonstrado do que está implementado.

A cópia em `tcc/victor/` permanece desatualizada em relação a esta base; sua consolidação não foi presumida sem a resposta sobre a pasta de escrita. A definição e a execução da avaliação pedagógica não foram inventadas para dar os apontamentos por encerrados.
