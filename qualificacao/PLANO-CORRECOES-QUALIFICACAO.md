# Plano de Ajustes — Qualificação (Banca de TCC I)

> **Fonte:** `igor/Qualificacao_Correcoes_Gabi.pdf` (79 págs.) — **119 anotações**
> extraídas (85 realces, 27 riscados, 7 notas flutuantes).
> **Autora das anotações:** Prof.ª Dsc. Gabriella Castro Barbosa Costa (Avaliadora 2
> da banca). Há também referência a questionamento do Prof. Me. Matheus Ávila
> Moreira de Paula (Avaliador 1) — item E1.
> **Documento anotado:** volume do **Igor** (`igor/TCC_Template.pdf`, 79 págs., mesma
> data de compilação do PDF anotado).
> **Escopo de aplicação decidido:** volume do Igor **+ espelhamento no volume do
> Victor** (`victor/`), que reproduz os mesmos problemas estruturais e de referências.

---

## STATUS DA EXECUÇÃO

**Aplicado nos dois volumes** (ambos recompilam sem erro, sem referência
indefinida e com **zero `Overfull \hbox`**):

| Bloco | Situação |
|---|---|
| **Categoria A** — formatação | ✅ A1–A12 aplicados. Estouros de margem no volume do Igor: **47 → 0**. |
| **Categoria B** — parágrafos de atribuição | ✅ 22 removidos no Igor, 21 no Victor (1 a mais que o previsto: `referencial.tex` l. 11, que escapou do filtro inicial por usar "adota como base"). |
| **Categoria C1–C3** — árvore de seções | ✅ "Engenharia de Software" virou seção 2.2 nos dois volumes; "Execução de Código de Máquina" voltou para Compiladores como 2.1.9; o nível 2.1.9.6 deixou de existir. |
| **Categoria D** — referências | ✅ **D1–D16 aplicados, sem pendências.** D4, D6, D10, D13 e D14 foram fechados com dados verificados na fonte primária. |
| **E4** — titulação do orientador | ✅ Resolvido sem precisar perguntar: o volume do Victor já trazia `Prof. Me.`, e o do Igor estava só com `Prof.`. Igualado. |
| **E9 + decorrências** — tom e pergunta de pesquisa | ✅ Aplicado nos dois volumes (E2, E3, E7, E9, E10, E11, E12, E13, E14). |
| **E15 + E16 + E17** — Scrum → \textit{Extreme Programming} | ✅ Aplicado nos dois volumes. **Zero menções a Scrum/Sprint/Backlog restantes.** |

### Lote sem dependência de decisão — 8 itens ✅

Aplicados nos dois volumes, sem necessitar de resposta dos autores:

| Item | O que foi feito |
|---|---|
| **C4** | Trabalhos Relacionados reagrupado nos dois grupos que o próprio texto já nomeava: **2.4.1 Ambientes Voltados à Iniciação em Programação** (Portugol, Quorum, Beecrowd) e **2.4.2 Projetos Didáticos de Construção de Compiladores** (Laila, \textit{chibicc}). As cinco ferramentas viraram blocos em negrito dentro dos grupos — deliberadamente **não** viraram `\subsubsection`, para não recriar o quarto nível de subdivisão que ela já havia criticado. |
| **C8** | Parágrafo de organização inserido na abertura do Cap. 4 dos dois volumes, remetendo a cada seção. |
| **E5** | "os documentos" e "o documento complementar" agora identificam explicitamente qual é o texto e quem é o autor. |
| **E6** | "volume" → "texto" em todas as ocorrências que se referem ao próprio documento (introdução e metodologia). |
| **E8** | Duas afirmações da introdução do Igor ganharam referência. O volume do Victor já as tinha. |
| **E29** | "tratado estritamente como um detalhe de infraestrutura" reescrito: agora fala em confinar a persistência a uma camada própria, sem minimizar sua importância. |
| **E30** | "materializa o princípio da coesão funcional" virou "é um primeiro passo na direção da coesão funcional", explicitando que a organização em diretórios sozinha não a garante — exatamente a objeção dela. |
| **E32** | Ver a nota abaixo: a correção foi diferente em cada volume. |

> ⚠️ **Sobre o E32 — a anotação não valia para os dois volumes.** Ela escreveu
> "Essa pirâmide não foi apresentada" no volume do Igor, e de fato o referencial
> dele não a apresentava. Mas o **referencial do Victor já trazia um parágrafo
> completo sobre a pirâmide de testes**. Em vez de suprimir a menção nos dois,
> a correção foi: **apresentar a pirâmide no referencial do Igor** (parágrafo novo
> na §2.2.2) e, nos dois volumes, trocar a citação solta por uma remissão explícita
> à seção onde o conceito é apresentado (`\ref{subsec:testes-tdd}`).

### Artefatos derivados do código-fonte — 4 itens ✅

Produzidos a partir do repositório real, não inventados. Todos entregues como
**rascunho para validação dos autores**.

| Item | O que foi feito | Fonte |
|---|---|---|
| **E25** | **Tabela "Elementos da linguagem passíveis de redefinição pelo usuário"** — 8 linhas, com forma canônica, exemplo de personalização e as restrições de validação. Nos dois volumes. | As restrições saíram literalmente das funções `validateOperatorWordMap`, `validateBooleanLiteralMap`, `validateBlockDelimiters` e `validateStatementTerminatorLexeme` de `compiler/src/lexer/config.ts`. |
| **E23** | **Diagrama de casos de uso** em TikZ, em página `landscape`: 4 atores (Visitante, Usuário autenticado, Aluno, Professor, com generalização UML) e **22 casos de uso**. Nos dois volumes. | Páginas em `ide/src/pages/`, rotas em `ide/src/pages/api/` e os 8 *routers* do FastAPI em `backend/app/modules/`. |
| **E28** | **Figura 4.1 refeita** — de imagem `.jpeg` simplificada para diagrama TikZ com as 4 camadas, seus módulos internos e os fluxos rotulados entre elas. Só no volume do Igor (era onde a banca apontou). | Texto da §4.1 + estrutura real dos pacotes. |
| **E33** | **Exemplo de teste real** em cada volume: `keyword-language-storage.spec.ts` (Igor, persistência da customização) e `operator-word-aliases.spec.ts` (Victor, equivalência entre operadores simbólicos e em forma de palavra). | Arquivos `.spec.ts` do repositório, transcritos sem alteração de lógica. |

**Escolhas de diagramação que vale conhecer:**

- No diagrama de casos de uso, o **Professor ficou à direita**, junto da coluna
  de casos de uso dele. Na primeira versão estava à esquerda e suas 7 associações
  atravessavam o diagrama inteiro.
- A **generalização do Professor** é roteada por baixo da fronteira do sistema.
  Roteada por cima, ela passava entre "Visitante" e "Usuário autenticado" e dava
  a impressão errada de que o Visitante herdava do Usuário autenticado.
- Na figura de arquitetura, a seta entre as rotas `/api` e o pacote `compiler`
  aponta **das rotas para o compilador** (quem depende de quem), não o contrário.

**Efeitos colaterais tratados:** o `.bib` não ganhou entradas novas; o preâmbulo
dos dois volumes recebeu `tikz` e os estilos dos diagramas; o volume do Victor
não tinha a linguagem `typescript` definida para o `listings` (só o do Igor
tinha) e ganhou a definição; a legenda da Figura 4.1 recebeu versão curta para
não estourar a margem na Lista de Figuras.

### Categoria E — itens fechados a partir do código-fonte ✅

| Item | O que foi feito |
|---|---|
| **E18** | **Padrões de projeto explicitados.** No volume do Victor: *Factory Method* (`LexerScannerFactory` escolhe o analisador por caractere), *Strategy* (`LexerScanner` abstrata com `run()` polimórfico) e *Iterator* (`TokenIterator`). No volume do Igor: *Provider* (os sete `contexts` do React) e os *hooks* como fachada sobre o pacote `compiler`. O referencial passou a remeter à seção onde estão enumerados. |
| **E19** | **Runtime resolvido por constatação, não por decisão.** Não existe nenhum `export const runtime = 'edge'` no projeto — logo, usa-se o *Node.js Runtime* padrão. Registrado na §4.1 com a justificativa (as rotas de validação precisam de acesso pleno às APIs do Node.js). |
| **E22** | **Metade fechada.** Parágrafo novo no referencial do Igor explicando o que a WAI-ARIA prescreve: *roles*, estados e propriedades, mais os requisitos de operação por teclado e de gerenciamento de foco. Referência nova: `w3c2023aria` (W3C Recommendation, 06/06/2023, verificada na fonte). A metodologia passou a remeter a essa seção. **Continua pendente:** como a acessibilidade foi verificada na prática. |
| **E24** | **Especificação de requisitos** — duas tabelas nos dois volumes: **20 requisitos funcionais** (RF01–RF20), derivados do diagrama de casos de uso, e **8 requisitos não funcionais** (RNF01–RNF08), derivados da metodologia (acessibilidade, responsividade, i18n, autonomia de execução, latência, consistência visual, testabilidade e segregação de acesso). |
| **E27** | **"E onde eu encontro todos esses fluxos?"** — a frase "cada fluxo da plataforma" agora remete ao diagrama de casos de uso. |

**Percalço tratado:** o `.aux` do volume do Igor ficou corrompido por uma
compilação interrompida (`File ended while scanning use of \@writefile`).
Resolvido apagando os auxiliares e recompilando do zero.

### Categoria C — reestruturação e capítulo faltante ✅

| Item | O que foi feito |
|---|---|
| **C5** | **As 5 ferramentas reescritas nos 3 eixos prometidos.** Cada uma agora tem três parágrafos com entrada em itálico: *Escolhas de interface*, *Recursos pedagógicos* e *Estratégias de interação*. Nos dois volumes, respeitando a redação própria de cada um. |
| **C6** | **Tabela 2.1 refeita** em página `landscape`, com os três eixos como colunas mais a coluna que expressa o diferencial (personalização da sintaxe pelo estudante). O volume do Victor **não tinha tabela comparativa** — ganhou a mesma, já que sua análise agora segue os mesmos eixos. |
| **C7** | **Capítulo de Considerações Finais criado** nos dois volumes, em `texto/consideracoes.tex`, com três seções: retomada dos objetivos (um a um, com o estado de cada), limitações e encaminhamentos. |
| **C9** | **§4.9 reorganizada por funcionalidade.** Os blocos de telas passaram a ser titulados pelos requisitos que materializam (RF01; RF15 e RF18; RF16 a RF20; RF03 a RF06), permitindo verificar quais requisitos já têm interface implementada. |

**Achados durante a reescrita:**

- A análise por eixos revelou algo que a descrição corrida escondia: **o
  `chibicc` não tem interface nenhuma** — é um repositório de código-fonte cuja
  fruição pressupõe editor, cadeia de compilação e Git já dominados. Isso agora
  aparece explicitamente na tabela e reforça o argumento de vocês sobre o
  público-alvo daquele grupo de ferramentas.
- Também ficou explícito que o retorno do Beecrowd **informa o resultado mas não
  localiza o erro** — distinção que sustenta o diferencial da plataforma proposta.
- **Erro factual corrigido no volume do Victor:** o texto chamava a gamificação
  do Beecrowd (fóruns e *rankings*) de "a chamada *Vibe Coding*". *Vibe coding*
  designa outra coisa — programação assistida por IA a partir de descrições em
  linguagem natural. O termo foi removido.
- As afirmações sobre a Laila ("demonstrou resultados altamente positivos", "o
  uso da plataforma eliminou os problemas de compatibilidade") foram atenuadas
  para o que o estudo de caso citado sustenta.

### Decisão 1 — pergunta de pesquisa e tom (E9)

Decidido pelos autores: **trocar o tom afirmativo pelo investigativo**, e mover o
teste da aplicação com público para trabalhos futuros. Aplicado assim:

- **Pergunta de pesquisa** — de *"é possível criar uma plataforma…"* para
  *"**em que medida** … contribui para reduzir a barreira sintática…"*, nos dois
  volumes. É o que ela pediu literalmente ("o quanto" ou "se").
- **Hipótese** — deixou de afirmar. "A hipótese responde afirmativamente" virou
  "trabalha-se com a hipótese, **ainda não submetida a verificação empírica**".
- **Delimitação de escopo** — parágrafo novo na introdução dos dois volumes: o
  trabalho entrega o artefato e o protocolo de avaliação; a aplicação junto a
  estudantes é encaminhamento futuro.
- **Objetivos específicos** — removidos "Estudar…" e "Participar…" (E12);
  incluídos implementação, integração e disponibilização (E13); "validar por
  estudos de caso" virou "definir o protocolo de avaliação" (E14).
- **Alegações não mensuráveis** (E11) — "conforto operacional" e "apoio
  pedagógico" foram substituídos por recursos concretos e verificáveis.
- **Resumos** (E2, E3) — agora dizem o que é o projeto como um todo, o que é
  **este** volume, qual o objetivo deste documento e o que ficou para depois.
- **Apêndices e proposta** — "estudos de caso em ambiente educacional" virou
  "definição do protocolo de avaliação".

> ⚠️ **Consequência provável: o item do Comitê de Ética (E26) deixa de existir.**
> Sem coleta de dados junto a pessoas dentro do escopo do TCC, não há pesquisa
> com seres humanos a submeter. Era o único item com prazo externo. **Confirmem
> com o orientador** antes de descartar de vez.

### Decisão 2 — Scrum substituído por \textit{Extreme Programming} (E16)

Decidido pelos autores: o que de fato usaram foi **desenvolvimento iterativo e
incremental com práticas de XP** — sem sprints de duração fixa, partindo de
requisitos mínimos, incorporando melhorias durante a própria implementação, e
com os dois integrantes acumulando todos os papéis.

- **Referencial** — a subseção "Gestão de Tarefas e Metodologias Ágeis" virou
  "**Desenvolvimento Iterativo e Incremental e \textit{Extreme Programming}**"
  nos dois volumes. Saíram Product Backlog, Sprint Backlog e papéis do Scrum.
- **Duas referências novas**, pesquisadas e verificadas:
  - `beck2004` — BECK, K.; ANDRES, C. *Extreme Programming Explained: Embrace
    Change*. 2. ed. Boston: Addison-Wesley, 2004. (obra canônica do método)
  - `wildt2015` — WILDT, D.; MOURA, D.; LACERDA, G.; HELM, R. *eXtreme
    Programming: práticas para o dia a dia no desenvolvimento ágil de software*.
    São Paulo: Casa do Código, 2015. (em português, mesma editora dos outros
    livros que vocês já citam)
- **`sabbagh2014` (livro de Scrum) foi removido do `.bib`** dos dois volumes —
  ficou órfão, como era de se esperar.
- **E15 e E17 resolvidos junto**: a metodologia dos dois volumes ganhou dois
  parágrafos que dizem explicitamente *como* cada prática foi instanciada,
  com remissão às seções de testes e de arquitetura. Era exatamente o "link
  entre a teoria e o que foi feito" que ela sentiu falta.

> 💡 **Efeito colateral positivo:** as subseções que vocês já tinham — TDD,
> Arquitetura Limpa, Clean Code — **são práticas de XP**. Com o XP como guarda-chuva,
> o referencial passou a ter uma linha condutora única em vez de tópicos soltos.

> ⚠️ **Pendência que eu não decidi por vocês:** a linha *"Testes, Validação com
> Usuários e Coleta de Feedback"* continua na Tabela 3.1 (cronograma), meses 9–11,
> nos dois volumes. Ela contradiz o novo texto. **Não alterei porque o cronograma
> veio da pré-proposta aprovada** — mexer nele é decisão de vocês com o orientador.
> É também o item C10, que ela já apontou como inconsistente.

**Páginas:** Igor 79 → 80 (figuras ampliadas e divididas); Victor 65 → 63
(remoção dos parágrafos de atribuição).

### Referências completadas por pesquisa (autorizado pelo autor)

Cinco entradas foram fechadas com dados **verificados na fonte primária**, não
inferidos. Nenhum `% TODO` restou no `.bib`. Data de acesso registrada:
**14 ago. 2026** — a data real da consulta.

| Entrada | O que faltava | Fonte verificada |
|---|---|---|
| `lai2025` | `url`, `urlaccessdate` | `https://nextjs.org/blog/next-16` — publicado 21/10/2025; os 4 autores do `.bib` conferem com o post. |
| `makerkit2026` | `url`, `urlaccessdate` | `https://makerkit.dev/blog/tutorials/nextjs-server-actions` — título bate literalmente; publicado 22/01/2026, atualizado 05/05/2026. Sem byline individual, então `author={MakerKit}` está correto. |
| `vercel2024` | `url`, `urlaccessdate` | `https://nextjs.org/docs/14/app/building-your-application/rendering/edge-and-nodejs-runtimes` — `lastUpdated: 2024-01-22`, bate com o ano do `.bib`. **Usei a URL versionada de propósito**: a URL canônica foi reestruturada e hoje redireciona para "Edge Runtime", com outro título; a versionada preserva o título citado e não sofre *link rot*. |
| `maonocodigo2022` | URL placeholder | `https://www.youtube.com/watch?v=VzOhnK0CuiE` — título do vídeo bate palavra por palavra com o `.bib`. |
| `silveira2012` | `author = {... and others}` | Ficha da editora: **Paulo Silveira, Guilherme Silveira, Sérgio Lopes, Guilherme Moreira, Nico Steppat, Fabio Kung e Jim Webber**. Acrescentei também o subtítulo "uma visão sobre a plataforma Java", exigido pela NBR 6023. |

Com isso, **os três "et al." das Referências desapareceram** — era o que ela
cobrou em `LAI et al.`, `SILVA et al.` e `SILVEIRA et al.`.

### Único ponto que ainda depende de vocês

- **Datas de acesso das referências antigas** — onde só havia o ano
  (`benedetti2025`, `mindmakers2025`) ou nada (`ferreira2025`, `lima2024`,
  `seyffert2026`, `ziemann2025`), usei **07 abr. 2026**, que é a data já adotada
  nas demais referências web do documento. **Confiram se corresponde à consulta
  real** — esse dado eu inferi, não verifiquei.

### Recomendação fora do escopo pedido

Sobraram três `\ContinuedFloat` no volume do Igor (Figuras do painel do aluno,
do painel do professor e da turma) com o mesmo padrão que ela mandou dividir em
4.7 e 4.8. Não mexi porque ela não os marcou, mas a banca final provavelmente
pega — a decisão é de vocês.

---

## Legenda de responsável

| Marca | Significado |
|---|---|
| 🟢 **APLICO** | Mecânico, baixo risco. Aplico direto no `.tex`/`.bib`. |
| 🟡 **APLICO + REVISÃO** | Aplico, mas vocês precisam conferir redação/conteúdo. |
| 🔵 **AUTOR** | Exige decisão de conteúdo, artefato novo (figura, diagrama) ou argumentação. |

## Legenda de espelhamento

| Marca | Significado |
|---|---|
| ⇄ | Aplicar também no volume do Victor (problema idêntico confirmado). |
| ⇄? | Verificar no volume do Victor antes de aplicar — provável, mas não confirmado. |
| — | Específico do volume do Igor. |

---

## Panorama: os 6 temas que a banca realmente cobrou

Antes das tabelas item a item, vale ler o que a professora está dizendo no
agregado. As 119 marcações se reduzem a seis exigências:

1. **Tirar os parágrafos de "esta seção baseia-se em X, Y e Z".** 22 riscados —
   é o maior bloco isolado de anotações. Ela quer a citação no ponto em que a
   ideia é usada, não uma declaração de fontes antes de cada subseção.
2. **Consertar a árvore de seções.** "Engenharia de Software" está como
   subseção de "Compiladores", e "Execução de Código de Máquina" está dentro de
   "Engenharia de Software". Ela marcou isso três vezes, inclusive no sumário.
3. **Ligar teoria a prática.** Cinco marcações distintas: Scrum, TDD/Clean Code,
   padrões de projeto, Next.js runtime, UX/UI. Em todas: "e no contexto de
   vocês, o que foi usado?".
4. **Especificar requisitos e funcionalidades.** Falta diagrama de casos de uso,
   falta lista de funcionalidades, e por isso "funcionalidade central" e
   "cada fluxo da plataforma" ficam sem referente.
5. **Refazer a análise dos trabalhos relacionados.** Vocês prometem analisar
   interface, recursos pedagógicos e interação com o estudante — e depois
   descrevem as ferramentas sem tocar nesses três eixos, inclusive na Tabela 2.1.
6. **Higiene ABNT.** Margens estouradas, datas de acesso, autores completos,
   itálicos, listagens quebradas entre páginas.

E um item que não é correção, é falta: **não existe capítulo de considerações
finais** com o que fica para o TCC II (item C7).

---

## CATEGORIA A — Formatação e tipografia (🟢 APLICO)

| # | Pág. | O que fazer | Onde | ⇄ |
|---|------|-------------|------|---|
| A1 | 1, 2, 3, 4 | **"(ide)" → "(IDE)"** na capa, folha de rosto, ficha e folha de aprovação. A sigla aparece minúscula porque `configcefetmglpd.cls` (l. 248) aplica `\MakeUppercase{1ª letra}\MakeLowercase{resto}` ao subtítulo. Correção: declarar `\DeclareRobustCommand{\siglaIDE}{IDE}` no preâmbulo e usar `\siglaIDE` dentro de `\subtitulo{}` — comandos robustos sobrevivem ao `\MakeLowercase`. | `TCC_Template.tex` l. 97–98 + preâmbulo | ⇄ |
| A2 | 33 | **`design` em itálico** em todas as ocorrências (`\textit{design}`). Hoje está inconsistente: já é itálico em `referencial.tex` l. 242, 248, 292 e reto em outros pontos. | `texto/referencial.tex`, `texto/metodologia.tex` | ⇄ |
| A3 | 44 | **`tokens` em itálico** em todas as ocorrências. Falta em `metodologia.tex` l. 2 ("customização dinâmica de tokens") e no título da §4.3. | `texto/metodologia.tex` | ⇄ |
| A4 | 28 | **Espaço faltando após aspas** (`a"d`) — aspas retas dentro de citação em `referencial.tex` l. 39 (`"passagens"`). Trocar por aspas LaTeX ` ``...'' ` e conferir o espaçamento. | `texto/referencial.tex` l. 39 | ⇄? |
| A5 | 51 | **Inserir tabulação** (recuo de primeira linha) no parágrafo iniciado por "Essa". Provável parágrafo colado a um `lstlisting` sem linha em branco — ver `metodologia.tex` l. 138, onde o texto começa na mesma linha do `\end{lstlisting}`. | `texto/metodologia.tex` l. 138 | — |
| A6 | 72 | **Remover espaço em branco** (lacuna vertical antes/depois de figura). Ajustar `[h]`/`[p]` e `\vspace` no bloco de figuras da §4.9. | `texto/metodologia.tex` l. 578–620 | — |
| A7 | 8, 12, 30, 41, 54, 57, 59 | **Margens estouradas.** O log de compilação registra **47 `Overfull \hbox`**. Correção em três frentes: (a) `\emergencystretch=3em` no preâmbulo, que elimina a maioria; (b) `\hyphenation{}` para `re-tar-ge-ta-bi-li-da-de` e quebra explícita com `\-` em "vermelho-verde-refatora"; (c) permitir quebra em identificadores `\texttt{}` longos (`\usepackage[htt]{hyphenat}` ou `\seqsplit`) — é o que causa os estouros em `editor-glass-light`, `Interpreter`, `LanguageImage`. | `TCC_Template.tex` preâmbulo + pontos citados | ⇄ |
| A8 | 8 | **Lista de Figuras: número de página fora da margem** (entrada "…Figura 4.7… 63"). As legendas longas empurram o número. Correção: usar `\caption[legenda curta]{legenda completa}` nas figuras da §4.9. | `texto/metodologia.tex` (todos os `\caption`) | ⇄? |
| A9 | 48 | **Listagens não podem quebrar entre páginas** — vale para *todas* as listagens do texto. Correção: `float=htbp` + `floatplacement=htbp` no `\lstset`, ou envolver cada `lstlisting` longa em `\begin{figure}[H]`. Conferir depois listagem por listagem. | `TCC_Template.tex` l. 60–72 (`\lstset`) | ⇄ |
| A10 | 61+ | **Ampliar as imagens até as margens** a partir da Figura 4.2. Hoje as `subfigure` usam `0.9\textwidth` dentro de `0.85–0.95\textwidth`. Subir para `\textwidth`. | `texto/metodologia.tex` l. 296–618 | — |
| A11 | 66, 68 | **Dividir as Figuras 4.7 e 4.8** em mais de uma figura, de modo que cada uma ocupe uma única página (hoje usam `\ContinuedFloat` atravessando páginas). | `texto/metodologia.tex` l. 402–445 e 451–492 | — |
| A12 | 31 | Trocar "ágil e sustentável" por **"de maneira ágil e sustentável"** (sugestão literal dela). | `texto/referencial.tex` l. 256 | ⇄? |

---

## CATEGORIA B — Remoção dos parágrafos de atribuição bibliográfica (🟡 APLICO + REVISÃO)

**22 riscados.** O comentário-padrão dela: *"Sugiro remover esse parágrafo e usar
a citação da referência no momento em que ela foi tratada/considerada."*

A remoção é segura porque **todos** os parágrafos seguintes já carregam `\cite{}`
das mesmas obras no fim de cada período. Ainda assim, marquei como 🟡 porque em
três casos o parágrafo riscado contém informação que não se repete adiante (B2,
B10, B22) e precisa ser realocada em vez de simplesmente apagada.

| # | Pág. | Linha (Igor) | Primeiras palavras | Nota | ⇄ (Victor) |
|---|------|--------------|--------------------|------|---|
| B1 | 12 | `introducao.tex` 7 | "As reflexões que abrem este capítulo…" | remover | ⇄ l. 5 |
| B2 | 16 | `referencial.tex` 11 | "Esta subseção usa como base a obra clássica…" | **realocar**: preserva o juízo de valor sobre Aho como referência canônica | ⇄? |
| B3 | 16 | `referencial.tex` 13 | "Em termos práticos," (riscado só a abertura) | remover a locução; frase começa em "Um compilador é…" | ⇄? |
| B4 | 17 | `referencial.tex` 32 | "A fundamentação teórica desta seção baseia-se…" | remover | ⇄ l. 34 |
| B5 | 19 | `referencial.tex` 63 | "As bases teóricas da etapa de análise léxica…" | remover | ⇄ l. 73 |
| B6 | 20 | `referencial.tex` 91 | "Os conceitos e definições apresentados a seguir…" | remover | ⇄ l. 99 |
| B7 | 23 | `referencial.tex` 140 | "Os fundamentos teóricos que norteiam a produção…" | remover | ⇄ l. 141 |
| B8 | 25 | `referencial.tex` 163 | "A exploração dos princípios de otimização…" | remover | ⇄ l. 163 |
| B9 | 26 | `referencial.tex` 189 | "Os fundamentos, os desafios e as estratégias…" | remover | ⇄ l. 185 |
| B10 | 27 | `referencial.tex` 213 | "A dinâmica operacional do código de máquina…" | remover (ver C2: o bloco inteiro muda de lugar) | ⇄ l. 198 |
| B11 | 28–29 | `referencial.tex` 226 | "Para a fundamentação teórica acerca da gestão de escopo…" | remover parágrafo inteiro (riscado em duas páginas) | ⇄ l. 213 |
| B12 | 29–30 | `referencial.tex` 236 | "Para a fundamentação da estratégia de testes…" | remover parágrafo inteiro (riscado em duas páginas) | ⇄ l. 224 |
| B13 | 30 | `referencial.tex` 246 | "Para a fundamentação das decisões arquiteturais…" | remover | ⇄ l. 248 |
| B14 | 31 | `referencial.tex` 254 | "Para o detalhamento conceitual e a definição das práticas…" | remover | ⇄ l. 258 |
| B15 | 32 | `referencial.tex` 274 | "Para a fundamentação teórica acerca dos conceitos arquiteturais…" | remover | ⇄ l. 278 |
| B16 | 33 | `referencial.tex` 286 | "Para a fundamentação teórica acerca dos conceitos, diferenças…" | remover | ⇄? |
| B17 | 34 | `referencial.tex` 298 | "Para a fundamentação conceitual acerca do uso de tecnologias…" | remover | ⇄ l. 292 |
| B18 | 36 | `referencial.tex` 321 | "Os elementos descritivos e funcionais do Portugol Studio…" | remover | ⇄ l. 312 |
| B19 | 36 | `referencial.tex` 329 | "A caracterização da arquitetura e os resultados pedagógicos…" | remover | ⇄ l. 323 |
| B20 | 37 | `referencial.tex` 337 | "Os princípios de projeto, os resultados experimentais…" | remover | ⇄ l. 333 |
| B21 | 38 | `referencial.tex` 345 | "A caracterização do compilador chibicc…" | remover | ⇄ l. 344 |
| B22 | 38 | `referencial.tex` 353 | "A descrição da plataforma Beecrowd…" | remover | ⇄ l. 352 |
| B23 | 39 | `referencial.tex` 361 | "A análise crítica desenvolvida nesta subseção organiza-se…" | remover **só a primeira oração**; a que remete à Tabela 2.1 fica | ⇄ l. 361 |

> ⚠️ **Efeito colateral a checar depois de aplicar:** algumas obras só aparecem
> nesses parágrafos. Se `martins2025`, `univali2026`, `quorum2025`, `ladner2019`,
> `garcia2024`, `maonocodigo2022` ficarem sem nenhuma citação no corpo, elas somem
> das Referências. Cada uma precisa reaparecer como `\cite{}` no ponto onde a
> informação correspondente é usada.

---

## CATEGORIA C — Estrutura e organização (🟡 APLICO + REVISÃO / 🔵 AUTOR)

| # | Pág. | O que fazer | Resp. | ⇄ |
|---|------|-------------|-------|---|
| C1 | 10, 27 | **"Engenharia de Software" não pode ser subseção de "Compiladores".** Hoje é `\subsection` 2.1.9 dentro da `\section{Compiladores}`, com Scrum, TDD, Arquitetura Limpa, Clean Code, Next.js e UX/UI como `\subsubsection` abaixo dela. Promover para `\section` (2.2) e rebaixar os filhos para `\subsection`. As demais seções renumeram em cascata. | 🟡 | ⇄ |
| C2 | 27 | **"Execução de Código de Máquina"** está como `\noindent\textbf{}` solto dentro de "Engenharia de Software" — ela marcou "Subtópico de Engenharia de Software???". É conteúdo de Compiladores: virar `\subsection` 2.1.9 da seção Compiladores, logo após "Geração de Código Objeto". | 🟡 | ⇄ |
| C3 | 33 | **Numeração `2.1.9.6` profunda demais** (riscada). Resolvida automaticamente por C1: com Engenharia de Software promovida a seção, o nível máximo cai para `2.2.6`. | 🟡 | ⇄ |
| C4 | 35 | **Reorganizar §2.3 em dois grupos.** O texto de abertura já divide as ferramentas em "ambientes de iniciação em programação" e "projetos didáticos de construção de compiladores" — ela pede que as subseções sigam essa divisão em vez de uma subseção por ferramenta. | 🟡 | ⇄ |
| C5 | 36 ×2, 37, 38 ×2 | **Reescrever a análise de cada ferramenta** (Portugol, Laila, Quorum, chibicc, Beecrowd) tratando explicitamente os três eixos prometidos: (1) escolhas de interface, (2) recursos pedagógicos, (3) estratégias de interação com o estudante. Hoje é descrição corrida sem ligação com esses critérios. Ela repetiu o comentário em todas as cinco. | 🔵 | ⇄ |
| C6 | 39 | **Refazer a Tabela 2.1** usando os mesmos três eixos como colunas. As colunas atuais (Público-alvo, Web, Gramática, Personalização, Avaliação) não são os critérios anunciados. | 🔵 | ⇄ |
| C7 | 15 | **Criar capítulo de Considerações Finais** — "Senti falta de um Capítulo com considerações finais, tratando o que ainda será apresentado como TCC II / cronograma etc.". Não existe: `TCC_Template.tex` l. 305–313 tem o capítulo comentado. É a lacuna estrutural mais séria da lista. | 🔵 | ⇄ |
| C8 | 44 | **Abrir o Cap. 4 com um parágrafo de organização** das subseções, situando o leitor. | 🟡 | ⇄ |
| C9 | 60 | **§4.9 "Apresentação das Telas": organizar por funcionalidade**, não pela ordem em que as telas existem. Depende de C11/D8 (lista de funcionalidades). | 🔵 | — |
| C10 | 42 | **Tabela de cronograma inconsistente** com as macroetapas descritas logo acima ("As atividades expressas aqui não condizem exatamente com as atividades descritas anteriormente"). Alinhar os dois. | 🟡 | ⇄ |

---

## CATEGORIA D — Referências e ABNT (🟢 APLICO)

Todas em `referencias.bib`. Diagnóstico da causa raiz: **o `abntex2cite` lê o
campo `urlaccessdate`, não `urldate`** — por isso duas entradas ficaram sem data
de acesso mesmo tendo o dado preenchido.

| # | Pág. | Entrada | Problema | Correção |
|---|------|---------|----------|----------|
| D1 | 75 | `alcantara2024` | Faltou data de acesso | `urldate` → `urlaccessdate = {30 mar. 2026}` |
| D2 | 75 | `benedetti2025` | "Faltou dia e mês" | `urlaccessdate = {2026}` → data completa |
| D3 | 75 | `ferreira2025` | Faltou data de acesso | acrescentar `urlaccessdate` |
| D4 | 75 | `lai2025` | "Inserir referência completa" | falta `url` e `urlaccessdate` |
| D5 | 75 | `lima2024` | Faltou data de acesso | acrescentar `urlaccessdate` |
| D6 | 75 | `makerkit2026` | "Inserir referência completa" | falta `url`, `publisher`, `urlaccessdate` |
| D7 | 76 | `mindmakers2025` | "Faltou dia e mês" | `urlaccessdate = {2026}` → data completa |
| D8 | 76 | `price2001` | Riscado "(Série Livros Didáticos)" | remover campo `series` |
| D9 | 76 | `seyffert2026` | Faltou data de acesso | acrescentar `urlaccessdate` |
| D10 | 76 | `silveira2012` | "Inserir todos os autores" | hoje é `Paulo Silveira and others` — listar os autores reais |
| D11 | 76 | `silva2020evasao` | "Inserir todos os autores" | os 7 já estão no `.bib`; o `et al.` vem da configuração do `abntex2cite` — forçar lista completa |
| D12 | 77 | `ziemann2025` | Faltou data de acesso | acrescentar `urlaccessdate` |
| D13 | 77 | `vercel2024` | "Inserir ref completa" | falta `url` e `urlaccessdate` |

**Defeitos que ela não marcou mas que a banca final vai pegar** (encontrados na
varredura do `.bib`):

| # | Entrada | Problema |
|---|---------|----------|
| D14 | `maonocodigo2022` | URL é um **placeholder**: `https://www.youtube.com/watch?v=ExemploUrl` |
| D15 | `martin_clean_coder_2` | Duplicata exata de `martin_coder`, nunca citada — remover |
| D16 | `firminiq2024`, `almeida2015` | Nunca citadas no texto — remover ou usar |

---

## CATEGORIA E — Conteúdo e argumentação (🔵 AUTOR)

Aqui eu não consigo decidir por vocês: são escolhas de escopo, de método e de
recorte da pesquisa. Organizei por onde aparecem.

### E.1 — Título, resumo e definição de "dinâmico"

| # | Pág. | Cobrança |
|---|------|----------|
| E1 | 1 | **"DINÂMICO"** — "Verificar se no texto fica claro o porquê dessa definição. Esse ponto também foi questionado pelo Matheus na banca; sugiro verificação junto aos orientadores." Os **dois avaliadores** bateram no mesmo ponto — trate como prioridade máxima. |
| E2 | 6 | Resumo: "**E qual é o objetivo DESTE TRABALHO?**" — o resumo termina em expectativas do projeto, sem enunciar o objetivo do volume. |
| E3 | 6 | Resumo: "Deixar claro **o que é o projeto como um todo** e o que está sendo tratado **neste trabalho**." Vale para os dois volumes. ⇄ |
| E4 | 4 | **Inserir titulação do orientador** na folha de aprovação. `TCC_Template.tex` l. 114 tem `\orientadorTitulo{Prof.}`; o coorientador tem `Prof. Dsc.`. Me confirmem a titulação correta do Prof. Luís Augusto Mattos Mendes e eu aplico (vira 🟢). ⇄ |

### E.2 — Introdução

| # | Pág. | Cobrança |
|---|------|----------|
| E5 | 12 | "**Deixar claro quais documentos**" e "**citar qual**" é o documento complementar — `introducao.tex` l. 3 e 5. |
| E6 | 12 | "**volume**" → trocar por "texto" ou "este documento". 🟢 assim que decidirem o termo. |
| E7 | 12 | "**Observa-se, com frequência,**" (l. 11) — "Quem observa e com qual frequência? Frase muito forte que necessita de referência." |
| E8 | 13 | Dois pontos sem referência: "iniciante" e "estudo". |
| E9 | 13 | **A pergunta de pesquisa precisa mudar.** "A questão deveria ser voltada para *o quanto* ou *se* essa plataforma ajuda e resolve o problema descrito." E, no parágrafo seguinte, "Essa afirmação demonstra que a pergunta de fato precisa ser alterada" — porque a hipótese já afirma o que a pergunta deveria investigar. Item de alto impacto: mexe em introdução, objetivos e metodologia de avaliação. |
| E10 | 13 | "**méritos próprios**" (l. 19) — "como assim? deixar claro!". |
| E11 | 14 | "**conforto operacional**" e "**apoio pedagógico**" (l. 21) — "como isso será medido?" (duas marcações). |
| E12 | 14 | **Objetivos específicos:** remover "Estudar, de forma crítica…" e "Participar do projeto…" — "Isso já é esperado e não é tradicional vir como objetivo específico". |
| E13 | 14 | **Objetivos específicos:** "Projetar a IDE web" — "E a implementação / integração / disponibilização, não entram como objetivos?". |
| E14 | 14 | "**estudos de caso**" no plural — "mais de um?!". Definir quantos e quais. |

### E.3 — Referencial: ligar teoria à prática

Cinco marcações com a mesma raiz. Se C1 (promover Engenharia de Software) for
feito junto, dá para resolver tudo em uma passada.

| # | Pág. | Cobrança |
|---|------|----------|
| E15 | 29 | **Metodologias ágeis:** "Senti falta de um link entre a teoria e o que foi feito/como vocês trabalharam… ficou muito teórico." |
| E16 | 43 | **Scrum:** "Então não faz sentido falar de Scrum no referencial teórico, apenas do que, DE FATO, foi utilizado." Cruza com `proposta.tex` l. 60, que admite não ter instanciado Scrum. **Decisão binária:** ou enxugam o referencial para desenvolvimento iterativo/incremental, ou justificam o Scrum. Recomendo enxugar. |
| E17 | 30 | **TDD / Clean Code:** "Deixar claro como esses conceitos foram aplicados no contexto do trabalho." |
| E18 | 31 | **Padrões de projeto:** "E quais padrões de projeto serão utilizados? Deixar claro." (`referencial.tex` l. 250). |
| E19 | 33 | **Next.js runtime:** "E no contexto de vocês, o que foi escolhido/utilizado?" — Node.js Runtime ou Edge Runtime. |
| E20 | 34, 35 | **UX/UI:** "E como esses conceitos de UX/UI serão tratados e avaliados no sistema de vocês?" e "Linkar esses conceitos com o que a plataforma adotará, para não ficar só um blábláblá danado." |
| E21 | 34 | **"Efeito estética-usabilidade"** — "Vocês realmente vão tratar isso? Acredito que isto está muito além do que de fato farão." Cortar ou assumir formalmente como parte da avaliação. |
| E22 | 44, 59 | **WAI-ARIA:** "O que essas diretrizes ditam? Por que isso não está no referencial teórico?" e "acessibilidade — e como isso foi verificado?". Falta a subseção no referencial **e** o método de verificação. |

### E.4 — Proposta e Metodologia: especificação

| # | Pág. | Cobrança |
|---|------|----------|
| E23 | 41, 47 | **Diagrama de Casos de Uso com TODAS as funcionalidades** — cobrado duas vezes. Sem ele, "A funcionalidade central da plataforma" (metodologia l. 37) fica sem referente: "não consigo distinguir qual delas seria a funcionalidade central". |
| E24 | 41 | **Especificação/documentação de requisitos** — "Senti falta de clareza". |
| E25 | 41 | **Tabela de possibilidades de personalização com exemplos**, "para ficar mais claro aos utilizadores" (`proposta.tex` l. 4). |
| E26 | 43 | **Comitê de Ética:** "Por envolver pessoas, a proposta de avaliação será submetida ao Comitê de Ética?" — precisa de resposta explícita no texto. Se a resposta for sim, há prazo de submissão a considerar antes dos estudos de caso do TCC II. |
| E27 | 44 | "**cada fluxo da plataforma**" — "E onde eu encontro todos esses fluxos???". |
| E28 | 44, 46 | **Figura 4.1 (arquitetura) insuficiente:** "A figura não traz isso… criar uma figura de arquitetura que realmente abranja o que é apresentado no texto" e "está muito simplificada". Artefato novo. ⇄ |
| E29 | 45 | "**estritamente como um detalhe de infraestrutura**" (metodologia l. 13) — "É realmente isso? UM DETALHE DE INFRAESTRUTURA???". Suavizar. ⇄ |
| E30 | 46 | "**Essa segmentação materializa o princípio da coesão funcional**" (metodologia l. 25) — "Frase extremamente forte! Para garantir coesão funcional é preciso muito mais do que separação em diretórios." Suavizar. ⇄ |
| E31 | 59 | **§4.8 Acessibilidade/Responsividade sem imagens:** "falam de acessibilidade e responsividade e não trazem nenhuma imagem das telas… senti falta de exemplos visuais". |
| E32 | 74 | **"Em conformidade com a pirâmide de testes"** (metodologia l. 629) — "Essa pirâmide não foi apresentada". Ou apresenta no referencial, ou remove a menção. ⇄ |
| E33 | 74 | **Adicionar exemplos dos testes realizados.** ⇄ |

---

## Espelhamento no volume do Victor

Confirmado por inspeção direta dos fontes:

- **Categoria B:** `victor/texto/referencial.tex` tem **20 parágrafos de
  atribuição** com a mesma fórmula, mais 1 em `introducao.tex`. Linhas mapeadas
  na tabela da Categoria B.
- **Categoria C1/C2/C3:** mesma árvore de seções defeituosa.
- **Categoria D:** `victor/referencias.bib` precisa da mesma varredura (ainda não
  comparei entrada por entrada — farei antes de aplicar).
- **Categoria A:** mesmo `.cls`, mesmo preâmbulo, mesmos problemas de margem.
- **Categoria E:** E3, E4, E9, E12, E13, E16, E22, E23, E26, E28, E29, E30, E32,
  E33 valem para os dois volumes, porque tratam do projeto, não do recorte.

**Não espelhar:** tudo que é da §4.9 (telas), do assistente de personalização e
das figuras da IDE — é eixo do Igor.

---

## Ordem de execução sugerida

1. **A + D** (formatação e referências) — mecânico, sem dependência, resolve 25 itens.
2. **B** (22 parágrafos de atribuição) — depois de A, para recompilar uma vez só e
   conferir quais referências ficaram órfãs.
3. **C1 + C2 + C3** (árvore de seções) — uma edição, resolve três marcações e o
   apontamento do sumário.
4. **E4, E6, E29, E30, E12** — ajustes pontuais de redação que eu aplico assim que
   vocês confirmarem.
5. **E9 + E16 + E1** — as três decisões de fundo (pergunta de pesquisa, Scrum,
   definição de "dinâmico"). Travam parte do resto; decidam antes de reescrever.
6. **C5 + C6** (trabalhos relacionados) e **E23 + E24 + E28** (casos de uso,
   requisitos, arquitetura) — reescrita e artefatos novos.
7. **C7** (Considerações Finais) — por último, porque consolida tudo.

---

## O que preciso de vocês para destravar

| Pergunta | Destrava |
|---|---|
| Titulação do Prof. Luís Augusto Mattos Mendes | E4 |
| Enxugar o Scrum do referencial ou justificar seu uso? | E16, E15 |
| Vão submeter ao Comitê de Ética? | E26 |
| Quantos estudos de caso, e com quais turmas? | E14, E9 |
| Node.js Runtime ou Edge Runtime? | E19 |
| Quais padrões de projeto foram de fato usados? | E18 |
| Autores reais de `silveira2012` (hoje "and others") | D10 |
| Cortar o "efeito estética-usabilidade" ou assumir na avaliação? | E21 |

---

## Apêndice — Inventário completo das 119 anotações

Extraído do PDF por coordenadas (realces e riscados trazem o texto sob a
marcação; notas flutuantes não têm texto associado).
| # | Pág. | Tipo | Trecho no PDF | Comentário da professora |
|---|---|---|---|---|
| 001 | 1 | realce | DINÂMICO | Verificar se no texto fica claro o por que dessa definição de 'dinâmico'; Esse ponto também foi questionado pelo Matheus na banca, portanto, sugiro a verificação junto aos orientadores. |
| 002 | 1 | realce | (ide | Colocar em Caixa Alta |
| 003 | 2 | realce | (ide |  |
| 004 | 3 | realce | (ide |  |
| 005 | 4 | realce | (ide |  |
| 006 | 4 | realce | Luís | Inserir titulação |
| 007 | 6 | realce | Este trabalho | O projeto como um todo, não? Deixar claro no resumo O QUE É O PROJETO COMO UM TODO e o que está sendo tratado NESTE TRABALHO. |
| 008 | 6 | realce | estruturais. | E qual é o objetivo DESTE TRABALHO? |
| 009 | 8 | realce | 63 | Ultrapassou as margens do documento. REVER. |
| 010 | 10 | realce | 2.1.9 Engenharia de Software . . . . . . . . . . . . . . . . . . . . . . . . . . . . 26 | Rever a estrutura de tópicos a partir daqui |
| 011 | 12 | realce | -científica, | Ultrapassando as margens. |
| 012 | 12 | realce | os documentos | Deixar claro quais documentos |
| 013 | 12 | realce | o documento complementar | citar qual |
| 014 | 12 | realce | volume | texto; ou este documento; |
| 015 | 12 | riscado | As reflexões que abrem este capítulo, bem como as considerações sobre as dificuldades enfrentadas por estudant | Sugiro remover esse parágrafo e usar a citação da referência no momento em que ela foi tratada/considerada. |
| 016 | 12 | realce | Observa-se, com frequência, | Quem observa e com qual frequencia? Frase muito forte que necessita de referência. |
| 017 | 13 | realce | iniciante. | Referência... |
| 018 | 13 | realce | estudo | Referência... |
| 019 | 13 | realce | é possível criar | A questão deveria ser voltada para 'o quanto' ou 'se' essa plataforma ajuda e resolve o problema descrito? |
| 020 | 13 | realce | reduz-se de forma significativa a carga cognitiva exigida no aprendizado simultâneo da lógica e da forma | Essa afirmação demonstra que a pergunta de fato precisa ser alterada... |
| 021 | 13 | realce | méritos próprios | como assim? deixar claro! |
| 022 | 14 | realce | conforto operacional | como isso será medido? |
| 023 | 14 | realce | apoio pedagógico | como isso será medido? |
| 024 | 14 | realce | Estudar, | Isso já é esperado e não é tradicional vir como objetivo específico... |
| 025 | 14 | realce | Participar do projeto | Mesmo comentário anterior... |
| 026 | 14 | realce | Projetar a IDE web | E a implementação / integração / disponibilização , não entram como objetivos? |
| 027 | 14 | realce | estudos de caso | mais de um?! |
| 028 | 15 | realce | testes adotada. | Senti falta de um Capítulo com considerações finais, tratando o que ainda será apresentado como TCCII / cronograma etc... |
| 029 | 16 | riscado | Esta subseção usa como base a obra clássica de Aho, Sethi e Ullman (1995), amplamente reconhecida na literatur | Sugiro remover esse parágrafo e usar a citação da referência no momento em que ela foi tratada/considerada. |
| 030 | 16 | riscado | Em termos práticos, |  |
| 031 | 17 | riscado | A fundamentação teórica desta seção baseia-se nas obras de referência de Aho, Sethi e Ullman (1995), Price e T | Mesmo comentário anterior... |
| 032 | 19 | riscado | As bases teóricas da etapa de análise léxica, exploradas nesta subseção, apoiam-se nos estudos de Cooper e Tor |  |
| 033 | 20 | riscado | Os conceitos e definições apresentados a seguir têm como base teórica os trabalhos de Aho, Sethi e Ullman (199 |  |
| 034 | 23 | riscado | Os fundamentos teóricos que norteiam a produção de código intermediário e o processo de tradução dirigida pela |  |
| 035 | 25 | riscado | A exploração dos princípios de otimização de código aqui delineada encontra seu lastro teórico nos tratados fu |  |
| 036 | 26 | riscado | Os fundamentos, os desafios e as estratégias que regem a etapa de geração de código objeto e o mapeamento de a |  |
| 037 | 27 | realce | 2.1.9 Engenharia de Software | Engenharia de Software como um SUBTÓTPICO de Compiladores?! Explicar... |
| 038 | 27 | realce | Execução de Código de Máquina | Subtópico de Engenharia de Software??? |
| 039 | 27 | riscado | A dinâmica operacional do código de máquina e a simbiose entre o hardware e o sistema operacional, discutidas  |  |
| 040 | 28 | realce | a"d | Faltou espaço após as aspas |
| 041 | 28 | riscado | Para a fundamentação teórica acerca da gestão de escopo e da adoção de metodologias ágeis neste trabalho, esta |  |
| 042 | 29 | riscado | incremental discutidos por AdaptWorks (2012). Para manter a fluidez da leitura, os conceitos de planejamento,  |  |
| 043 | 29 | nota |  | Senti falta de um link entre a teoria e o que foi feito/como vocês trabalharam... ficou muito 'teórico', sem deixar claro o que, de fato, foi usado sobre metodologias ágeis. |
| 044 | 29 | riscado | Para a fundamentação da estratégia de testes e da adoção do Test-Driven Development (TDD), esta subseção apoia |  |
| 045 | 30 | riscado | Martin (2011), na estruturação arquitetural de testes defendida por Martin (2019) e na literatura específica d |  |
| 046 | 30 | realce | vermelho-verde-refatora | Ultrapassando as margens |
| 047 | 30 | nota | o elevad | Deixar claro como esses conceitos foram aplicados no contexto do trabalho... |
| 048 | 30 | riscado | Para a fundamentação das decisões arquiteturais e dos padrões de projeto adotados neste trabalho, esta subseçã |  |
| 049 | 31 | realce | favorece o uso de padrões de projeto e abstrações voltadas à redução de acoplamento entre os módulos | E quais padrões de projeto serão utilizados? Deixar claro. |
| 050 | 31 | riscado | Para o detalhamento conceitual e a definição das práticas de Clean Code (Código Limpo) descritas nesta subseçã |  |
| 051 | 31 | realce | ágil e sustentável | sugiro colocar: "de maneira ágil e sustentável" |
| 052 | 32 | riscado | Para a fundamentação teórica acerca dos conceitos arquiteturais, da evolução do sistema de roteamento e das es |  |
| 053 | 33 | realce | O desenvolvedor pode optar pelo Node.js Runtime padrão, que possui acesso completo a todas as APIs e ao ecossi | E no contexto de vocês, o que foi escolhido/utilizado? |
| 054 | 33 | riscado | 2.1.9.6 |  |
| 055 | 33 | riscado | Para a fundamentação teórica acerca dos conceitos, diferenças e aplicabilidades do User Experience (UX) e User |  |
| 056 | 33 | realce | design | Colocar todas as ocorrências em itálico |
| 057 | 34 | nota | funciona | E como esses conceitos de UX / UI serão tratados e avaliados no sistema de vocês? |
| 058 | 34 | realce | Essa intersecção técnica também é fortemente influenciada por aspectos cognitivos e leis da psicologia. O cham | Vocês realmente vão tratar isso??? Acredito que isto está muito além do que de fato farão... |
| 059 | 34 | riscado | Para a fundamentação conceitual acerca do uso de tecnologias no ambiente escolar abordada nesta subseção, este |  |
| 060 | 35 | nota | . | Linkar esses conceitos com o que a plataforma adotará, para não ficar só um blábláblá danado... |
| 061 | 35 | realce | de um lado, os ambientes voltados à iniciação em programação; de outro, os projetos didáticos de construção de | Se aqui você divide as soluções em dois grupos distintos, sugiro dividir as subseções nesses dois grupos ao invés de subseções com os nomes das soluções... |
| 062 | 36 | realce | Portugol Studio e Portugol Webstudio | Anteriormente vocês dizem que serão analisados: (1)escolhas de interface, (2) os recursos pedagógicos e (3) as estrategias de interação com o estudante. Portanto, eu esperava ver uma discussão acerda de cada um desses tópicos e não um texto superficial das ferramentas , sem link direto a essas características... Sugiro reescrever o detalhamento de cada uma dessas tecnologias, analisando de forma clara e direta cada um desses aspectos. |
| 063 | 36 | riscado | Os elementos descritivos e funcionais do Portugol Studio e de sua versão executada em navegador, apresentados  |  |
| 064 | 36 | realce | 2.3.2 Laila: Gerador de Analisadores Léxicos e Sintáticos Online | Considerar comentário feito na Seção 2.3.1 |
| 065 | 36 | riscado | A caracterização da arquitetura e os resultados pedagógicos da plataforma Laila, discutidos a seguir, baseiam- |  |
| 066 | 37 | realce | 2.3.3 Quorum: Linguagem de Programação Baseada em Evidências | Considerar comentário feito na Seção 2.3.1 |
| 067 | 37 | riscado | Os princípios de projeto, os resultados experimentais e os recursos de ambiente da linguagem Quorum, abordados |  |
| 068 | 37 | realce | pela equipe responsável | ??? |
| 069 | 38 | realce | 2.3.4 chibicc: Uma Abordagem Incremental para o Ensino de Compiladores | Considerar comentário feito na Seção 2.3.1 |
| 070 | 38 | riscado | A caracterização do compilador chibicc e de sua estratégia educacional baseia-se no projeto e na documentação  |  |
| 071 | 38 | realce | 2.3.5 Beecrowd: Prática de Algoritmos e Avaliação Automatizada | Considerar comentário feito na Seção 2.3.1 |
| 072 | 38 | riscado | A descrição da plataforma Beecrowd, de seus mecanismos de avaliação automatizada e de seus efeitos no aprendiz |  |
| 073 | 39 | riscado | A análise crítica desenvolvida nesta subseção organiza-se em torno das características discutidas anteriorment |  |
| 074 | 39 | realce | Tabela 2.1 – Comparativo entre as ferramentas analisadas e a plataforma proposta. | Esperava encontrar nessa tabela os critérios comparativos citados no início da seção (1)escolhas de interface, (2) os recursos pedagógicos e (3) as estrategias de interação com o estudante... |
| 075 | 41 | realce | plataforma educacional web | Senti falta de um Diagrama de Casos de Uso com TODAS as funcionalidades da plataforma. |
| 076 | 41 | realce | Em termos concretos, oferece-se ao usuário a possibilidade de redefinir o vocabulário das palavras-chave, esco | Sugiro montar uma tabela com todas essas possibilidades, incluindo exemplos, para ficar mais claro aos utilizadores. |
| 077 | 41 | realce | compiladores | Ultrapassando as margens. |
| 078 | 41 | realce | Definição de requisitos | Senti falta de clareza na especificação/documentação dos requisitos da plataforma. |
| 079 | 42 | realce | Atividade | As atividades expressas aqui não condizem exatamente com as atividades descritas anteriormente - sugiro rever/reorganizar o texto ou a tabela para ficarem com atividades condizentes. |
| 080 | 43 | realce | Cabe ressaltar que, por se tratar de uma equipe reduzida, composta por apenas dois integrantes, os papéis form | Então não faz sentido falar de Scrum no referencial teórico, apenas do que, DE FATO, foi utilizado no trabalho... |
| 081 | 43 | realce | base comum | que base comum? |
| 082 | 43 | realce | à condução dos estudos de caso, à coleta de evidências empíricas em sala de aula e à análise comparativa entre | E o que pensam a respeito disto? Por envolver pessoas, a proposta de avaliação será submetida ao Comitê de Ética? |
| 083 | 44 | realce | tokens | Colocar todas as ocorrências em itálico |
| 084 | 44 | realce | acessibilidade | E como isso foi verificado? |
| 085 | 44 | realce | os princípios do desenvolvimento ágil discutidos por AdaptWorks (2012) e Sabbagh (2014) | E quais são eles? Isso não ficou claro no refencial teórico... |
| 086 | 44 | realce | cada fluxo da plataforma | E onde eu encontro todos esses fluxos??? |
| 087 | 44 | nota |  | Esse capítulo traz diversas subseções; sugiro trazer aqui a organização do restante das subseções de forma a situar o leitor com relação ao que será apresentado... |
| 088 | 44 | realce | dividindo o projeto em três camadas independentes e bem delimitadas: | A figura 4.1 não traz isso... Sugiro criar uma figura de arquitetura que realmente abranja o que é apresentado no texto... |
| 089 | 45 | realce | estritamente como um detalhe de infraestrutura | É realmente isso? UM DETALHE DE INFRAESTRUTURA??? |
| 090 | 46 | realce | Figura 4.1 | Sugiro detalhar melhor a arquitetura de forma a englobar todo o conteúdo apresentado anteriormente... está muito simplificada... |
| 091 | 46 | realce | Essa segmentação materializa o princípio da coesão funcional | Frase extremamente forte! Para garantir a coesão funcional é preciso muito mais do que simplesmente essa separação em diretórios! |
| 092 | 47 | realce | A funcionalidade central da plataforma, | Novamente, senti falta de uma especificação de TODAS as funcionalidades da plataforma, para poder distinguir qual delas seria 'a funcionalidade central' |
| 093 | 48 | realce | Listing 4.1 – Tipos que descrevem a configuração customizável do lexer. | Colocar toda a listagem em uma única página, evitando a quebra; verificar isso para todas as listagens ao longo do texto... |
| 094 | 51 | realce | Essa | Inserir tabulação |
| 095 | 54 | realce | light, | Ultrapassando as margens. |
| 096 | 57 | realce | O Interpreter, | Ultrapassando as margens |
| 097 | 59 | realce | eImage. | Ultrapassando as margens |
| 098 | 59 | realce | 4.8 Acessibilidade, Responsividade e | Vocês falam de acessibilidade e responsividade e não trazem nenhum imagem das telas da aplicação... senti falta de exemplos 'visuais' de aplicação dos conceitos citados... |
| 099 | 59 | realce | cumprimento das diretrizes WAI-ARIA | O que essas diretrizes ditam? Pq isso não está no referencial teórico? |
| 100 | 60 | realce | 4.9 Apresentação das Telas da Plataforma | Sugiro a apresentação das telas em razão das funcionalidades previstas ... |
| 101 | 61 | realce | Figura 4.2 | Sugiro ampliar as imagens a partir daqui até as margens do documento, para melhorar a visualização |
| 102 | 66 | realce | Figura 4.7 – | Dividir em mais de uma Figura, de forma que ocupem uma mesma página |
| 103 | 68 | realce | Figura 4.8 | Mesmo comentário anterior |
| 104 | 72 | nota |  | Remover espaço em braco |
| 105 | 74 | realce | Em conformidade com a pirâmide de testes | Essa pirâmide não foi apresentada |
| 106 | 74 | nota |  | Adicionar exemplos dos testes realizados. |
| 107 | 75 | realce | ALCANTARA, F. Tabela de Símbolos. 2024. Disponível em: <https://frankalcantara.com/lf/11 -tabelaSimbolos.html> | Faltou data de acesso. |
| 108 | 75 | realce | 2026. | Faltou dia e mês |
| 109 | 75 | realce | Disponível em: <https://doi.org/10.29069/forscience.2025v13n2.e1313>. | Faltou data de acesso. |
| 110 | 75 | realce | LAI, J. et al. Next.js 16. [S.l.]: Vercel, 2025 | Inserir referencia completa |
| 111 | 75 | realce | Disponível em: <https://www.alura.com.br/artigos/arquitetura-da-informacao>. | Faltou data de acesso. |
| 112 | 75 | realce | MAKERKIT. Next.js Server Actions: The Complete Guide (2026). 2026. | Inserir referência completa |
| 113 | 76 | realce | 2026. | Faltou dia e mês |
| 114 | 76 | riscado | (Série Livros Didáticos). |  |
| 115 | 76 | realce | l em: <https://www.softdesign.com.br/blog/desve ndando-a-diferenca-entre-ux-e-ui-design/>. | Faltou data de acesso |
| 116 | 76 | realce | et al | Inserir todos os autores |
| 117 | 76 | realce | . et al | Inserir todos os autores |
| 118 | 77 | realce | VERCEL. Rendering: Edge and Node.js Runtimes. [S.l.]: Vercel, 2024. | inserir ref completa |
| 119 | 77 | realce | Disponível em: <https://pagepro.co/blog/nextjs-app-router-vs-pages-router/>. | faltou data de acesso |
