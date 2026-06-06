# Plano de Ajuste — TCC I (Igor) — Correções do Orientador

> Fonte: `TCC_I-Igor-corrigido.pdf` (65 págs.) — 114 anotações extraídas
> (comentários de margem + texto destacado por coordenadas).
> Normas de referência: **NBR 14724:2024** (estrutura), **NBR 10520:2023**
> (citações), **NBR 6023:2025** (referências).

Legenda de responsável:
- 🟢 **EU** — posso aplicar diretamente no `.tex` (baixo risco).
- 🟡 **EU + revisão** — aplico, mas precisa o autor conferir conteúdo/redação.
- 🔵 **AUTOR** — exige decisão de conteúdo, ativo (imagem) ou argumentação.
- ⚪ **DEFERIDO** — citações ao longo do texto (mesma política adotada no TCC do
  Victor: "vamos resolver depois").

---

## CATEGORIA A — Correções diretas de texto (🟢 EU)

> **STATUS (aplicado):** A1, A2, A3, A4, A5, A6, A8, A9, A10 ✅ concluídos.
> A7 — já estava correto no fonte ("traduzi-lo", sem acento); nenhuma alteração necessária.
> A11 (HTTP→HTTPS) — **não aplicado**: é uma *pergunta* do orientador, exige sua
> decisão (em dev é HTTP; em produção, HTTPS). Mudar "HTTP" em massa quebraria
> termos genéricos como "rotas HTTP". Decida o texto e eu ajusto.
> A12 (título "APÊNDICE A") — **movido para a Frente B**: é formatação da classe
> `.cls`, exige recompilação para validar.

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
| A12 | 64 | Ajuste do título do **APÊNDICE A** ("PLANO DE TRABALHO: DIVISÃO DE RESPONSABILIDADES") | `texto/apendice.tex` |

> ⚠️ Nota A2: a hifenização correta vem do babel-brazil (já carregado pela classe).
> As quebras erradas costumam ser de palavras que o babel não conhece. O bloco
> `\hyphenation{}` resolve caso a caso, sem risco.

---

## CATEGORIA B — Estrutura e numeração (🟡 EU + revisão)

> **STATUS:** B1, B2, B3, B7 ✅ aplicados (referencial).
> B4, B5, B6, B8, B9 (reestruturação da §4.8 "Apresentação das Telas") — **deferidos
> a pedido do autor**: é uma *sugestão* do orientador com marcações de numeração
> contraditórias; o autor decidirá depois revisando o PDF.
> A12 (título "APÊNDICE A") — **deferido ao autor**: formatação da classe `.cls`,
> exige recompilar para validar.

| # | Pág. | O que fazer |
|---|------|-------------|
| B1 | 14 | **Inserir texto-âncora** no início do Cap. 2 apresentando o que será abordado (orientador removeu o texto genérico atual e pede um melhor). |
| B2 | 20 | Remover subdivisão com título "**Tipos de Erros Semânticos**" → transformar em texto corrido encadeado. |
| B3 | 22 | Remover subdivisão com título "**Método de Geração Dirigida pela Sintaxe**" → texto corrido. |
| B4 | 54 | Remover seção "**.8 Página Inicial e Identidade Visual**" (evitar seção muito subdividida) → fundir no texto. |
| B5 | 55 | Remover seção "**Painel do Aluno**" → fundir. |
| B6 | 56 | Remover seção "**Painel do Professor**" → fundir. |
| B7 | 18, 19 | Ajuste de numeração de lista (carets "I)", "II)"). |
| B8 | 57 | Ajuste de numeração ("4.8.1 -" inserido pelo orientador). |
| B9 | 58 | Consequência: se acatar B4-B6 e separação de figuras, a numeração muda — revisar refs cruzadas. |

---

## CATEGORIA C — Figuras e layout de código (🔵 AUTOR + 🟡 EU parcial)

> **STATUS (C4 — subfiguras):** ✅ aplicado. Todos os grupos de subfiguras viraram
> empilhamento vertical em **largura total** (`subfigure{\textwidth}`), mantendo
> rótulos e referências (`\ref`) atuais:
> - Pares a/b: Fig. 4.2 (home), 4.4 (aluno), 4.6 (professor), Etapas iniciais,
>   Etapa 3, Etapa 4.
> - 4 partes: Fig. 4.7 (listas) e 4.8 (exercícios) — empilhadas.
> - 3 partes: Etapa 6 — empilhada.
>
> ⚠️ **Pendência técnica:** uma `figure[H]` **não quebra entre páginas**. Com 3–4
> imagens em largura total, Fig. 4.7, 4.8 e Etapa 6 ultrapassam a altura de uma
> página e vão **transbordar** (não dividir) ao compilar. Solução recomendada:
> usar `\ContinuedFloat` para dividir em duas páginas mantendo o mesmo número —
> aguardando aval do autor (não consigo compilar para validar aqui).
>
> Itens C1, C2, C3, C5, C6 abaixo continuam pendentes (código→figura, imagem
> faltando, etc.).

| # | Pág. | O que fazer |
|---|------|-------------|
| C1 | 42–47, 50 | **Converter os `Listing` (código) em Figuras**: trocar a legenda "Listing" por "**Figura**", **reduzir o espaçamento** do código para caber em **uma única imagem numa mesma página**, e atualizar as referências no texto ("mostrado na Figura 4.x"). ~7 blocos de código. |
| C2 | 41,43,44,45,47,49 | Inserir/ajustar as **chamadas das figuras** no texto: "apresentado na Figura 4.1", "Figura 4.2", ..., "Figura 4.7" (orientador escreveu as redações exatas na margem). |
| C3 | 40 | **Faltou a imagem** + "colocar a imagem junto com o nome dela na mesma página". (precisa do ativo/imagem) |
| C4 | 55–60 | **Separar subfiguras** (4.2a/4.2b, 4.4a/4.4b, 4.6a/4.6b...) em **figuras independentes** para facilitar a visualização. |
| C5 | 60 | Usar a **largura máxima** da página (respeitando margens) na figura apontada. |
| C6 | 60 | **Reordenar a Figura 4.13** para depois da Figura 4.12. |

> C3 e parte de C4 dependem de **ativos (prints/imagens)** que só o autor tem.
> O ajuste de LaTeX (legendas, `subfigure`→figuras, espaçamento dos `lstlisting`,
> `width=\textwidth`, reordenação) eu consigo fazer.

---

## CATEGORIA D — Conteúdo e argumentação (🔵 AUTOR decide)

| # | Pág. | Comentário do orientador | Ação sugerida |
|---|------|--------------------------|---------------|
| D1 | 10 | "sugiro apoiar esta afirmação [reprovação/evasão] em algum estudo" + "dê uma olhada nesse trabalho e nos citados nele" | Buscar e citar estudo sobre reprovação/evasão em programação. |
| D2 | 11 | "tem certeza que nenhuma ferramenta permite isso? [contribuição inédita]" + "esteja preparado para contra-argumentar" | Suavizar a alegação de ineditismo OU embasar; preparar resposta de banca. |
| D3 | 26 | "não há essa equipe desenvolvendo os múltiplos papéis definidos pelo scrum" + "ponto de discussão" | Corrigir afirmação sobre equipe multidisciplinar/Scrum (realidade: dupla). |
| D4 | 31 | "a solução de vcs não é para auxílio no ensino? Não compreendi compiladores como trabalhos relacionados" | Rever enquadramento dos compiladores na seção de trabalhos relacionados. |
| D5 | 36 | "penso que são características a serem comparadas na tabela proposta" | Levar os itens (vocabulário, delimitadores, operadores...) para a tabela comparativa. |
| D6 | 37 | "dupla, como relatado no capítulo 1" | Ajustar referência ao trabalho em dupla. |

---

## CATEGORIA E — Citações ao longo do texto (⚪ DEFERIDO ao autor)

Mesma política do TCC do Victor: **não mexer agora**, o autor resolve depois.
O orientador repetiu este comentário em **~15 trechos**:

> "não é suficiente para eliminar as citações ao longo do texto. Portanto, a cada
> trecho que remete a uma citação esta deverá ser adequadamente referenciada."

**Páginas:** 14, 15, 17, 18, 21, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32.

Relacionados (também citação — decisão do autor):
- **p20–21:** estilo do separador `;` em citações com 3 autores —
  `(AHO; SETHI; ULLMAN, 1995; COOPER; TORCZON, 2012)` fica confuso. O orientador
  lembra que `;` separa **referências diferentes**. Sugestão: usar `et al.`
  (permitido pela NBR 10520:2023 para 3+ autores) → `(Aho et al., 1995; Cooper;
  Torczon, 2012)`. **6 ocorrências.** *(Observação: já são `\cite{}` — o ajuste é
  de estilo/agrupamento, não de código quebrado.)*
- **p14, p17:** "definir a partir de citação" (front-end/back-end; lexema/token).
- **p28:** "referenciar a citação" (definições de UX e UI — 2 trechos).

> Importante: as citações **já estão como `\cite{}`** no fonte (64 no referencial,
> 23 na metodologia). O `??)` que apareceu no TCC do Victor era artefato de build;
> aqui o pedido é de **conteúdo** (referenciar cada afirmação), não de código.

---

## Resumo quantitativo

| Categoria | Itens | Responsável |
|-----------|-------|-------------|
| A — Texto direto | 12 grupos (≈25 ocorrências) | 🟢 EU |
| B — Estrutura/numeração | 9 | 🟡 EU + revisão |
| C — Figuras/layout | 6 grupos | 🔵 AUTOR + 🟡 EU parcial |
| D — Conteúdo/argumentação | 6 | 🔵 AUTOR |
| E — Citações | ~15 + relacionados | ⚪ DEFERIDO |

## Ordem de execução sugerida

1. **Frente 🟢 A** (texto direto) — rápida, sem dependências.
2. **Frente 🟡 B** (estrutura) — remover subdivisões, texto-âncora, numeração.
3. **Frente 🟡 C (parte LaTeX)** — Listings→Figuras, separar subfiguras, larguras.
4. **Frente 🔵 C (ativos) + D** — depende do autor (imagens + decisões de conteúdo).
5. **Frente ⚪ E** — citações, quando o autor decidir abordar.
