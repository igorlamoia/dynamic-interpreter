# Plano de Ajuste — TCC I (Igor) — Correções do Orientador

> Fonte: `TCC_I-Igor-corrigido.pdf` (65 págs.) — 114 anotações extraídas
> (comentários de margem + texto destacado por coordenadas).
> Normas de referência: **NBR 14724:2024** (estrutura), **NBR 10520:2023**
> (citações), **NBR 6023:2025** (referências).

Legenda de responsável:
- 🟢 **EU** — posso aplicar diretamente no `.tex` (baixo risco).
- 🟡 **EU + revisão** — aplico, mas precisa o autor conferir conteúdo/redação.
- 🔵 **AUTOR** — exige decisão de conteúdo, ativo (imagem) ou argumentação.
- ⚪ **DEFERIDO** — item postergado por decisão do autor.

---

## CATEGORIA A — Correções diretas de texto (🟢 EU)

> **STATUS (aplicado):** A1, A2, A3, A4, A5, A6, A8, A9, A10 ✅ concluídos.
> A7 — já estava correto no fonte ("traduzi-lo", sem acento); nenhuma alteração necessária.
> A11 (HTTP→HTTPS) — ✅ **decidido: manter HTTP** (decisão do autor). Sem alteração.
> A12 (título "APÊNDICE A") — ✅ aplicado: o título do apêndice foi explicitado
> como "APÊNDICE A -- PLANO DE TRABALHO: DIVISÃO DE RESPONSABILIDADES".

| # | Pág. | O que fazer | Onde |
|---|------|-------------|------|
| A1 | 1, 2 | **Ano 2025 → 2026** na capa e na ficha (orientador destacou o "5" de 2025, comentário "6") | `TCC_Template.tex` linha 100: `\data{2025}` → `\data{2026}` |
| A2 | 4,17,20,23,41,49,50,53,61,65 | **Divisão silábica errada** (10 palavras quebrando mal: assimi-lação, repre-sentação, hierár-quica, ins-truções, respon-sabilidade, soli-citação, anali-sadas, moni-tor, corres-pondentes, especiali-zados) → adicionar bloco `\hyphenation{}` no preâmbulo com a separação correta | `TCC_Template.tex` preâmbulo |
| A3 | 10 | Padronizar `feedback` em **itálico** | `texto/*.tex` |
| A4 | 39, 53 | `backend` → `\textit{back-end}` (padronizar) | `texto/metodologia.tex` |
| A5 | 40 | `frontend` → `\textit{front-end}` (padronizar) | `texto/metodologia.tex` |
| A6 | 4 | **Eliminar o recuo** do parágrafo apontado | `texto/referencial.tex` |
| A7 | 14 | **Eliminar espaço em branco** + corrigir acento "í" | `texto/referencial.tex` |
| A8 | 12 | Strikeout: ajustar "document(o)" → "trabalho" | `texto/referencial.tex` |
| A9 | 38 | "a etapa coberta por este documento" → "**as etapas** cobertas..." (orientador inseriu "s") | `texto/metodologia.tex` |
| A10 | 47 | Verificar terminologia: "registo/registo" → "**registro**"? | `texto/metodologia.tex` |
| A11 | 49 | "HTTP" → verificar se deveria ser **HTTPS** | `texto/metodologia.tex` |
| A12 | 64 | ✅ Ajuste do título do **APÊNDICE A** ("PLANO DE TRABALHO: DIVISÃO DE RESPONSABILIDADES") no título do capítulo | `texto/apendice.tex` |

> ⚠️ Nota A2: a hifenização correta vem do babel-brazil (já carregado pela classe).
> As quebras erradas costumam ser de palavras que o babel não conhece. O bloco
> `\hyphenation{}` resolve caso a caso, sem risco.

---

## CATEGORIA B — Estrutura e numeração (🟡 EU + revisão)

> **STATUS:** B1, B2, B3, B7 ✅ aplicados (referencial).
> B4, B5, B6, B8, B9 (reestruturação da §4.8 "Apresentação das Telas") — ✅ aplicados:
> as subseções "Página Inicial", "Painel do Aluno" e "Painel do Professor" foram
> fundidas em blocos textuais; o "Fluxo de Personalização" permanece como a subseção
> numerada da seção.
> A12 (título "APÊNDICE A") — ✅ aplicado no título do capítulo.

| # | Pág. | O que fazer |
|---|------|-------------|
| B1 | 14 | **Inserir texto-âncora** no início do Cap. 2 apresentando o que será abordado (orientador removeu o texto genérico atual e pede um melhor). |
| B2 | 20 | Remover subdivisão com título "**Tipos de Erros Semânticos**" → transformar em texto corrido encadeado. |
| B3 | 22 | Remover subdivisão com título "**Método de Geração Dirigida pela Sintaxe**" → texto corrido. |
| B4 | 54 | ✅ Remover seção "**.8 Página Inicial e Identidade Visual**" (evitar seção muito subdividida) → fundida no texto. |
| B5 | 55 | ✅ Remover seção "**Painel do Aluno**" → fundida no texto. |
| B6 | 56 | ✅ Remover seção "**Painel do Professor**" → fundida no texto. |
| B7 | 18, 19 | Ajuste de numeração de lista (carets "I)", "II)"). |
| B8 | 57 | ✅ Ajuste de numeração: o fluxo de personalização permanece como subseção numerada da seção de telas. |
| B9 | 58 | ✅ Consequência de B4-B6: refs cruzadas preservadas, pois os labels das figuras não foram alterados. |

---

## CATEGORIA C — Figuras e layout de código (🔵 AUTOR + 🟡 EU parcial)

> **STATUS — ✅ CONCLUÍDA a reorganização das figuras de sessão.** Padrão final
> adotado (em conjunto com o autor):
> - Subfiguras a `0.9\textwidth` com `\includegraphics[width=\textwidth]`.
> - Placement `[p]` (página dedicada) + `\FloatBarrier` após cada figura de sessão
>   (9 barreiras) → impede o *float drift* (figura do aluno não vaza mais para a
>   seção do professor).
> - Sessões de 3–4 imagens divididas com `\ContinuedFloat` (4.7 e 4.8 em 2+2;
>   Etapa 6 em 2+1), mantendo um único número de figura.
> - `\usepackage{placeins}` adicionado ao preâmbulo (para o `\FloatBarrier`).
> - Bug de compilação corrigido: a Fig. 4.4 (aluno) estava sem `\end{figure}`
>   (aninhava as figuras → erro "Not in outer par mode"); a 4.7 estava quebrada em
>   3 ambientes. Ambas remontadas. Ambientes balanceados (16 `figure`/23 `subfigure`).
> - "Listing" não existe mais (C1 sem efeito): os blocos de código já são
>   "Trecho de Código" (`lstlisting`).
>
> ✅ **Residual verificado no compile:** a numeração das figuras divididas com
> `\ContinuedFloat` não duplicou números anteriores. A lista de figuras ficou em
> sequência correta (4.4, 4.6, 4.7, 4.8 e 4.13), com as etapas do assistente em
> ordem de 4.9 a 4.13.
>
> ✅ **C3 aplicado:** imagem da arquitetura copiada da qualificação do Victor
> (`qualificacao/victor/Figuras/design.jpeg`) para
> `Figuras/arquitetura-plataforma.jpeg`, e o `\includegraphics` foi reativado.
>
> Os itens C1/C2/C5/C6 da tabela abaixo eram derivados do PDF mas **não se aplicam**
> ao estado atual do documento (não há "Listing" nem "Figura 4.13").

| # | Pág. | O que fazer |
|---|------|-------------|
| C1 | 42–47, 50 | **Converter os `Listing` (código) em Figuras**: trocar a legenda "Listing" por "**Figura**", **reduzir o espaçamento** do código para caber em **uma única imagem numa mesma página**, e atualizar as referências no texto ("mostrado na Figura 4.x"). ~7 blocos de código. |
| C2 | 41,43,44,45,47,49 | Inserir/ajustar as **chamadas das figuras** no texto: "apresentado na Figura 4.1", "Figura 4.2", ..., "Figura 4.7" (orientador escreveu as redações exatas na margem). |
| C3 | 40 | ✅ Imagem inserida (`Figuras/arquitetura-plataforma.jpeg`) e chamada reativada no texto. |
| C4 | 55–60 | **Separar subfiguras** (4.2a/4.2b, 4.4a/4.4b, 4.6a/4.6b...) em **figuras independentes** para facilitar a visualização. |
| C5 | 60 | Usar a **largura máxima** da página (respeitando margens) na figura apontada. |
| C6 | 60 | **Reordenar a Figura 4.13** para depois da Figura 4.12. |

> Parte de C4 ainda depende de **ativos (prints/imagens)** que só o autor tem, caso o autor decida separar todas as subfiguras em figuras independentes.
> O ajuste de LaTeX (legendas, `subfigure`→figuras, espaçamento dos `lstlisting`,
> `width=\textwidth`, reordenação) eu consigo fazer.

---

## CATEGORIA D — Conteúdo e argumentação (🔵 AUTOR decide)

> **STATUS:** D3 ✅ tratado — adicionada ressalva em `proposta.tex` (regime de
> trabalho) esclarecendo que, por ser uma dupla, os papéis/cerimônias formais do
> Scrum não foram instanciados, apenas as práticas iterativas essenciais.
> D1 ✅ tratado — embasada a afirmação de reprovação/evasão na introdução com
> `\cite{souza2016,silva2020evasao}` (mesmas fontes do TCC do Victor; as duas
> entradas foram copiadas para o `referencias.bib` do Igor). A redação do Igor já
> diferia da do Victor, sem risco de plágio.
> D4 ✅ tratado — reescrita a introdução da seção "Trabalhos relacionados"
> (`referencial.tex`) explicando que a plataforma fica na **fronteira** entre
> ensino de programação e construção de compiladores, justificando a inclusão de
> ferramentas de compiladores (Laila, chibicc) como trabalhos relacionados.
> D2 ✅ tratado — na justificativa (introdução), "contribuição inédita" → "abordagem
> ainda pouco explorada", ancorada na análise comparativa (gramáticas fixas
> predominam); claim defensável diante da banca.
> D5 ✅ tratado — criada a **Tabela~\ref{tab:comparativo}** na "Análise Crítica"
> (`referencial.tex`) comparando as 6 ferramentas × características (público, web,
> gramática, personalização da sintaxe, avaliação automatizada), destacando a
> personalização pelo usuário como diferencial. Adicionado `\usepackage{array}`.
> D6 ✅ tratado — no parágrafo do regime de trabalho (`proposta.tex`), o regime em
> dupla passa a remeter à introdução (Capítulo~\ref{cap:introducao_modelo}),
> atendendo ao "dupla, como relatado no capítulo 1".
>
> **CATEGORIA D 100% concluída (D1–D6).**

| # | Pág. | Comentário do orientador | Ação sugerida |
|---|------|--------------------------|---------------|
| D1 | 10 | "sugiro apoiar esta afirmação [reprovação/evasão] em algum estudo" + "dê uma olhada nesse trabalho e nos citados nele" | Buscar e citar estudo sobre reprovação/evasão em programação. |
| D2 | 11 | "tem certeza que nenhuma ferramenta permite isso? [contribuição inédita]" + "esteja preparado para contra-argumentar" | Suavizar a alegação de ineditismo OU embasar; preparar resposta de banca. |
| D3 | 26 | "não há essa equipe desenvolvendo os múltiplos papéis definidos pelo scrum" + "ponto de discussão" | Corrigir afirmação sobre equipe multidisciplinar/Scrum (realidade: dupla). |
| D4 | 31 | "a solução de vcs não é para auxílio no ensino? Não compreendi compiladores como trabalhos relacionados" | Rever enquadramento dos compiladores na seção de trabalhos relacionados. |
| D5 | 36 | "penso que são características a serem comparadas na tabela proposta" | Levar os itens (vocabulário, delimitadores, operadores...) para a tabela comparativa. |
| D6 | 37 | "dupla, como relatado no capítulo 1" | Ajustar referência ao trabalho em dupla. |

---

## CATEGORIA E — Citações ao longo do texto (✅ aplicado)

Mesma política aplicada posteriormente no TCC do Victor: as citações foram
distribuídas ao longo dos trechos conceituais do referencial teórico, mantendo as
referências já usadas pelo Igor e aproveitando o mesmo padrão de granularidade.
Também foram removidos marcadores residuais de comentários (`% [n]`) e trocadas
citações textuais soltas como `(ZIEMANN, 2025)` e `(SEYFFERT, 2026)` por comandos
LaTeX/ABNT (`\citeonline{...}`).

O orientador repetiu este comentário em **~15 trechos**:

> "não é suficiente para eliminar as citações ao longo do texto. Portanto, a cada
> trecho que remete a uma citação esta deverá ser adequadamente referenciada."

**Páginas:** 14, 15, 17, 18, 21, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32.

Relacionados (também citação):
- **p20–21:** as ocorrências foram mantidas como `\cite{...}`; a renderização
  ABNT será controlada pelo estilo bibliográfico.
- **p14, p17:** "definir a partir de citação" (front-end/back-end; lexema/token)
  tratado em `texto/referencial.tex`.
- **p28:** "referenciar a citação" (definições de UX e UI — 2 trechos) tratado
  com `\citeonline{seyffert2026}`, `\citeonline{yablonski2020}`,
  `\citeonline{lima2024}` e `\citeonline{raposo2012}`.

> Importante: a validação final deve ser feita no PDF, mas o fonte agora contém
> citação explícita nos trechos conceituais apontados.

---

## Resumo quantitativo

| Categoria | Itens | Responsável |
|-----------|-------|-------------|
| A — Texto direto | 12 grupos (≈25 ocorrências) | 🟢 EU |
| B — Estrutura/numeração | 9 | 🟡 EU + revisão |
| C — Figuras/layout | 6 grupos | 🔵 AUTOR + 🟡 EU parcial |
| D — Conteúdo/argumentação | 6 | 🔵 AUTOR |
| E — Citações | ~15 + relacionados | ✅ aplicado |

## Ordem de execução sugerida

1. **Frente 🟢 A** (texto direto) — rápida, sem dependências.
2. **Frente 🟡 B** (estrutura) — remover subdivisões, texto-âncora, numeração.
3. **Frente 🟡 C (parte LaTeX)** — Listings→Figuras, separar subfiguras, larguras.
4. **Frente 🔵 C (ativos) + D** — depende do autor (imagens + decisões de conteúdo).
5. **Frente ✅ E** — citações distribuídas no referencial.
