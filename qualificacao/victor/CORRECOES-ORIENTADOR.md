# Correções do orientador — registro de ajustes

Documento gerado a partir das anotações de `TCC_I-Victor-corrigido.pdf` (texto-base: `TCC_Template.tex` + `texto/*.tex`).

> **Nota:** as marcações sobre citações ("não é suficiente para eliminar as citações ao longo do texto. Portanto, a cada trecho que remete a uma citação esta deverá ser adequadamente referenciada", além de "é uma citação? qual a fonte?", "referência?", "Segundo Fulano (ano)", "reforce a citação com Pressman ou Sommervile") são a **Frente D** — iniciada em 2026-06-05 (ver bloco "Front D" abaixo).

---

> **Auditoria 2026-06-05:** verificação linha a linha mostrou que parte do que estava
> marcado como aplicado no resumo/preâmbulo **nunca havia entrado no arquivo** (o doc
> superdeclarou). Reaplicados nesta data: resumo PT (remoção da afirmação empírica de
> sala de aula, "permite ao usuário", reescrita do fecho com "diferencial", `\indent`),
> abstract EN espelhado, e titulação do orientador `Prof.` → `Prof. Msc.`. As mudanças
> dos capítulos (`introducao`, `referencial`, `apendice`) foram confirmadas como
> realmente presentes.
>
> **Ajustes adicionais 2026-06-05 (decisão do autor):**
> - Coerência intro/objetivos com o eixo individual (núcleo): `introducao.tex` objetivo
>   geral "comandos" → "vocabulário"; objetivo específico "Desenvolver interface web" →
>   "Integrar o núcleo a uma interface web (contratos de comunicação)"; "validar
>   viabilidade técnica e pedagógica" → "Avaliar tecnicamente... validade do núcleo".
> - Varredura "comandos" → terminologia precisa: trocado onde prometia customização
>   inexistente (`metodologia.tex:2`, seção `:71` agora "Especificação da Linguagem e de
>   seus Elementos Configuráveis", `:165` "construções de alto nível", `referencial.tex:365`).
>   Mantido onde correto: título do Igor (`introducao:3`), cronograma aprovado
>   (`proposta:24`), descrições de Portugol/Quorum, e usos genéricos de "instrução".
> - **p40 RESOLVIDO (2026-06-05):** retenção/dificuldade em programação agora referenciada
>   com `souza2016` e `silva2020evasao` (ver bloco Front D).
>
> **Front A — deliverables concretos (2026-06-05):**
> - [x] **p15** texto-âncora no início do Cap. Referencial (`referencial.tex`), com visão
>   geral das frentes + intro da Seção Compiladores; corrigido "capitulo"→"capítulo".
> - [x] **p34 (parcial)** texto-âncora antes de "Trabalhos Relacionados" + título
>   corrigido para "Trabalhos Relacionados" + `\label{sec:trabalhos-relacionados}`
>   (removido label duplicado solto no fim da seção). FALTA o **método de seleção** dos
>   trabalhos (Front B — depende do critério do autor).
> - [x] **p52** lista de scanners agora também em tabela (`Tabela~\ref{tab:scanners}` em
>   `metodologia.tex`), mantida a descrição no corpo.
> - [x] **p47 (parcial)** Apêndice "DOCUMENTAÇÃO DA API" (`\label{ap:api}`) com tabela de
>   recursos + links Swagger/ReDoc; referenciado no corpo. FALTA o "é"→"são" (não
>   localizado sem o PDF — pedir ao autor o trecho exato).
> - [x] **p58** Apêndice "CASOS DE TESTE AUTOMATIZADOS" (`\label{ap:testes}`): 215 casos
>   em 22 arquivos (tokens 8 / léxica 56 / sintática-semântica 138 / interpretação 13),
>   tabela-resumo + link do repositório; e clarificado no corpo que a suíte roda
>   integralmente a cada mudança (acumula, detecta regressões).
> - [x] **p44 (parcial)** nomenclatura padronizada para "esquema lógico" (corpo+legenda).
>   FALTA confirmar **normalização** das tabelas (Front B — confirmação do autor).
>
> **Front B — decisões/confirmações (2026-06-05):**
> - [x] **p57** figuras duplicadas. TDD: mantida só a 2.3 (`fig:ciclo_tdd`, fonte
>   `firminiq2024`); removida a 4.5 do Cap.4 (que tinha citação quebrada "FIRMINIQ.") e o
>   texto passou a citar a 2.3. lex.png: era figura do **Nystrom** mal atribuída como
>   "elaborado pelo autor" no Cap.4 (Fig 4.4) — figura removida; texto religado à 2.2
>   (`fig:lexemas_nystrom`, fonte Nystrom). Bônus: corrigido caminho `packages/compiler /src/tests`.
> - [x] **p14** reorganização mínima: `\chapter` Cap.2 → "REFERENCIAL TEÓRICO E TRABALHOS
>   RELACIONADOS"; Cap.4 "MODELAGEM" → "METODOLOGIA" (labels `cap:referencial`/`cap:modelagem`
>   mantidos). Não se moveu proposta/cronograma (decisão do autor).
> - [x] **p2/p3** ficha/aprovação: já resolvido no working tree (`\data{2026}`, `\aprovacao*`
>   comentados). Confirmar visualmente no PDF.
> - [~] **p44** normalização: autor optou por NÃO inserir frase agora; tratará direto com o orientador.
> - [x] **p34** método de seleção dos trabalhos relacionados: autor optou por "seleção por
>   representatividade dos dois eixos". Criada `\section{Seleção dos Trabalhos Relacionados}`
>   (`sec:selecao-trabalhos`) na Metodologia, com critérios de inclusão explícitos (sem fingir
>   revisão sistemática); referência cruzada adicionada na abertura de Trabalhos Relacionados.
>
> **Front C — layout / margens (2026-06-05):**
> - [x] **Global anti-overflow:** `\setlength{\emergencystretch}{3em}` no preâmbulo do
>   `TCC_Template.tex` — elimina a maioria dos *overfull \hbox* de prosa (ex.: "obrigatoriamente").
> - [x] **Tabela da API (Apêndice):** rotas longas (`POST /api/submissions/validate`,
>   `/class-exercise-lists`) quebradas com `\allowbreak`; adicionado pacote `array` e coluna
>   "Recurso"/"Camada" com `>{\raggedright\arraybackslash}` (sem buracos de justificação).
> - [x] **p53 + identificadores CORROMPIDOS:** um formatador automático havia quebrado
>   identificadores com espaço no meio — corrigidos `consumeStmtTerminator` (era "consumeStmt er"),
>   `IssueInfo` (era "IssueIn- fo") e `packages/compiler` (era "packages/compil er"), com `\allowbreak`.
>   ⚠️ ALERTA: não rodar o formatador automático de LaTeX nos `texto/*.tex` — ele recria esses erros.
> - [x] **Travessões removidos:** todos os 13 `—` substituídos por parênteses/vírgulas conforme
>   o contexto (parênteses quando o aposto já tinha vírgulas internas), em `metodologia`,
>   `proposta` e `referencial`.
> - [ ] **PENDENTE (precisa do PDF):** figura fora da margem (p43); figura/legenda em páginas
>   diferentes (p15); "Leopoldina 2026" em página solta (p4); espaços em branco (p15); sumário.
> - [ ] **PENDENTE p47:** "é"→"são" — não localizado sem o PDF; autor deve apontar o trecho exato.
>
> **Front D — citações (iniciada 2026-06-05):**
> - [x] **Seção "Softwares Educativos" (`referencial.tex` 294-298):** a atribuição em
>   bloco da linha 292 (benedetti2025/mindmakers2025) não bastava — os 3 parágrafos
>   seguintes não citavam nada e cada frase terminava em `" ."` (placeholder). Distribuídas
>   citações ao fim de cada parágrafo (294 `\cite{benedetti2025}`; 296 `\cite{mindmakers2025}`;
>   298 `\cite{benedetti2025,mindmakers2025}`) e removidos os 8 espaços-antes-de-ponto.
> - [x] **Introdução (`introducao.tex` paras 7 e 9):** afirmação de que aprender lógica e
>   sintaxe ao mesmo tempo é a barreira — citado `\cite{stefik2013}` (achado empírico dele,
>   "An Empirical Investigation into Programming Language Syntax"). A atribuição-âncora da
>   linha 5 (stefik2013/ferreira2025) foi mantida.
> - [x] **Auditoria geral:** `metodologia.tex` está bem citado (toda afirmação teórica já
>   tem fonte: Martin, Elmasri, Aho, Cooper, Aniche, Stefik). `proposta.tex`/`apendice.tex`
>   sem `\cite` por serem escopo/cronograma e documentação do próprio trabalho (sem
>   afirmação externa). Demais subseções do referencial abrem com atribuição nomeada.
> - [x] **p40 RESOLVIDO (2026-06-05):** adicionadas 2 fontes reais à bib e citadas na frase
>   "altos índices de reprovação e evasão" (`introducao.tex:7`): `souza2016` (SOUZA; BATISTA;
>   BARBOSA. *Problemas e Dificuldades no Ensino e na Aprendizagem de Programação: um
>   Mapeamento Sistemático*. RBIE, v.24, n.1, 2016) e `silva2020evasao` (SILVA et al.
>   *Minerando dados de um juiz on-line para prever a evasão...*. SBIE, 2020, p.1343-1352).
> - [x] **Reforço Pressman/Sommerville (2026-06-05):** adicionados `pressman2016` (Engenharia
>   de Software, 8.ed., AMGH) e `sommerville2018` (Engenharia de Software, 10.ed., Pearson),
>   citados no parágrafo cascata × ágil (`referencial.tex:215`).
> - [x] **DISTRIBUIÇÃO DAS CITAÇÕES ao longo do texto (2026-06-05):** atendendo à correção
>   central do orientador ("a atribuição em bloco no início não basta; cada trecho que remete
>   a uma citação deve ser referenciado"), foi feita a varredura completa do `referencial.tex`:
>   (a) **removidas todas as cláusulas-muleta** do tipo "para manter a fluidez da leitura, tudo
>   a seguir reflete as ideias desses autores" (13 subseções); (b) **citações distribuídas ao
>   fim de cada parágrafo** mostrando a procedência de cada ideia — referencial passou de ~24
>   para **87** comandos de citação, seguindo o sistema autor-data da ABNT NBR 10520; (c) os
>   marcadores numéricos comentados residuais (`% [3, 4]` etc., resquício de rascunho que ainda
>   engolia o ponto final em alguns parágrafos) foram trocados por `\cite{}` reais ou removidos.
>   `metodologia.tex` já seguia o padrão correto (citações integradas nas frases) e descreve
>   majoritariamente trabalho próprio; `introducao.tex` também foi distribuída.

---

## 1. Ajustes JÁ APLICADOS

### Preâmbulo / folha de aprovação (`TCC_Template.tex`)
- [x] Orientador: titulação `Prof.` → `Prof. Msc.`
- [x] Avaliador 2: `Prof. Dsc. Alex da Silva Temoteo` → `Profª. Drª Gabriella Castro Barbosa Costa`
- [x] Avaliador 3 (Diego Ascanio Santos): removido (comentado)

### Resumo / Abstract (`TCC_Template.tex`)
- [x] "Ensinar programação" → "O ensino de programação"
- [x] "permite aos usuários" → "permite ao usuário"
- [x] "(incluindo análise léxica e sintática) e integração" → "que inclui análise léxica e sintática e a integração"
- [x] Removida afirmação empírica não sustentada ("Aplicações preliminares em sala de aula sugerem...") → "Espera-se como resultado que a plataforma seja um facilitador..."
- [x] Última frase reescrita p/ clareza: "O diferencial da plataforma está em permitir..."
- [x] Resumo sem recuo de primeira linha: `\indent` → `\noindent` (decisão do autor 2026-06-05)
- [x] `Keywords` movido para a linha de baixo (abstract)
- [x] Abstract em inglês espelhado para manter consistência (orientador só marcou o português)

### Introdução (`texto/introducao.tex`)
- [x] "Este TCC" → "Este Trabalho de Conclusão de Curso (TCC)"
- [x] "documentos" → "trabalhos"
- [x] "Para entender o sistema..." → "Por se tratar de trabalhos complementares e interdependentes, para a compreensão do sistema..."
- [x] "torna o processo mais difícil do que precisaria ser" → "aumenta a dificuldade do processo de aprendizagem"
- [x] Pergunta de pesquisa reescrita: "...reduzir a barreira de aprendizagem a partir da personalização da sintaxe da linguagem que o aluno está aprendendo?"
- [x] "ajustar" → "ajustar ou adaptar"
- [x] "mudar isso: construir" → "oportunizar a mudança desse cenário a partir da construção de"
- [x] "torne essa" → "permita uma"
- [x] "atrito" → "obstáculo"
- [x] "mercado" → "mercado de trabalho"
- [x] Objetivo geral: "o ensino e a aprendizagem" → "o processo de ensino-aprendizagem"
- [x] Objetivos específicos reestruturados (separados estudar/analisar e projetar/implementar) e invertido validar/avaliar: "Avaliar a solução desenvolvida ... para validar sua viabilidade..."

### Referencial / Metodologia (`texto/referencial.tex`, `texto/metodologia.tex`)
- [x] Padronização `Frontend`/`Backend`/`frontend` → `front-end`/`back-end`
- [x] "ferramentas analisadas no referencial teórico" → "...nos trabalhos relacionados"

### Apêndice (`texto/apendice.tex`)
- [x] "entregue à Coordenação" → "aprovado pelo Colegiado"
- [x] "(este documento)" → "(esta monografia)"

> **Build:** a classe `configcefetmglpd.cls` falha localmente com `\configurecaptions undefined` *antes* de chegar ao conteúdo (falta um pacote LaTeX neste ambiente). Confirmado que ocorre também sem as edições — as alterações acima são apenas prosa/itemize/valores de preâmbulo, sem risco sintático.

---

## 2. PENDENTE — precisa de decisão/ação do autor

### 2.1 Data de aprovação × ano da ficha catalográfica (p2 e p3)
A classe usa a **mesma** variável `\printaaprovacaoAno` na ficha catalográfica ("2025") **e** na folha de aprovação ("Aprovado em: 14 de fevereiro de 2025").
- Ficha (p2): orientador escreveu "isso está correto?" → provavelmente deveria ser **2026**.
- Folha de aprovação (p3): orientador pediu "deixar em branco".
- **Conflito:** não dá para atender os dois sem editar `configcefetmglpd.cls` (linhas ~708 ficha e ~765 folha). Decidir: ajustar o ano e/ou desacoplar as duas no `.cls`.

### 2.2 Reorganização estrutural de capítulos (p14)
Orientador sugere:
- "Capítulo 2 - Referencial Teórico e Trabalhos relacionados"
- "Capítulo 3 - Metodologia"
- e questiona o melhor lugar para apresentar proposta + cronograma ("onde os demais TCCs apresentaram?").

Hoje: Cap. 2 = REFERENCIAL TEÓRICO, Cap. 3 = PROPOSTA, Cap. 4 = MODELAGEM. Mudança de estrutura → decisão do autor.

### 2.3 Layout (recompilar resolve, ou exige ajuste manual)
- [ ] Sumário com páginas desatualizadas (p10) → recompilar resolve.
- [ ] "Leopoldina 2026" sobrando em página solta (p4) → quebra de página da capa.
- [ ] Figura fora da margem da página (p43).
- [ ] Código `consumeStmtTerminator` fora da margem (p53).
- [ ] Figura e sua legenda em páginas diferentes (p15) → "colocar a imagem na mesma página do nome da imagem".
- [ ] Espaços em branco a eliminar (p15).

### 2.4 Conteúdo novo / pesquisa (não pode ser inventado)
- [ ] **p15:** inserir "texto âncora" no início do Cap. 2 relatando o que o capítulo contempla.
- [ ] **p34:** inserir "texto âncora" antes de "Trabalhos Relacionados" + **explicitar o critério/método de seleção** dos trabalhos relacionados (deixar claro num método no capítulo de Metodologia).
- [x] **p40 (RESOLVIDO 2026-06-05):** retenção/dificuldade em programação referenciada com `souza2016` (mapeamento sistemático RBIE 2016) e `silva2020evasao` (SBIE 2020) na introdução. Ver bloco Front D.
- [x] **p27 (RESOLVIDO 2026-06-05):** Scrum rebaixado. `metodologia.tex:4` agora declara explicitamente que **não** houve adoção formal de framework ágil (papéis/cerimônias inviáveis para dupla), apenas desenvolvimento iterativo/incremental + TDD; citação `sabbagh2014` removida da metodologia. `referencial.tex:212` reescrito: Scrum mantido como referência teórica, com "práticas pontuais... sem papéis e cerimônias formais".
- [ ] ~~**p27 original:**~~ cuidado metodológico com **Scrum** — é necessário equipe com tamanho mínimo para que cada papel seja exercido (conforme o manifesto); se estiver adotando Scrum metodologicamente, rever ("a Gabriella vai bater forte").
- [x] **p41/p61 (RESOLVIDO 2026-06-05):** reenquadramento da divisão de trabalho, com base na pré-proposta aprovada (`qualificacao/igor/proposta_igor.pdf`), que atribui o **núcleo do interpretador** ao Victor e a **plataforma/personalização** ao Igor. Alterado: (a) `proposta.tex:45` — não afirma mais "núcleo construído pelos dois juntos"; agora o núcleo é a demanda individual desta monografia e a colaboração fica nas fronteiras/integração; (b) `apendice.tex` — núcleo retirado de "Regime Colaborativo" e movido para o eixo individual do Victor; (c) `proposta.tex:49` — TCC II não reivindica mais "estudos de caso em sala de aula / coleta de evidências empíricas" (trabalho do Igor), focando em avaliação técnica do núcleo. Resumo já teve a afirmação empírica removida.
- [ ] ~~**p41 original (IMPORTANTE):**~~
  - "Trabalho de Conclusão de Curso??" sobre o termo "documento".
  - "mas este não é o seu trabalho???" — o núcleo do compilador (análise léxica, sintática, geração e execução de código intermediário) está descrito como trabalho conjunto, mas pelo título é a **sua** demanda.
  - "se colocar assim a banca vai bater muito em vc".
  - O parágrafo sobre o TCC II **não bate com o cronograma** — alinhar para evitar problemas. Além disso, se o estudo de caso (coletar feedback) é trabalho do Igor, **não pode ser tratado como demanda sua**.
  - → Exige reescrever o enquadramento da divisão de trabalho.
- [ ] **p42:** a "abordagem metodológica adotada para o desenvolvimento" deve ser especificada na **Metodologia**; as fases "implementada e validada por meio de testes automatizados" não estão inseridas em **Modelagem**.
- [ ] **p44:** confirmar se as tabelas foram **normalizadas** (comentário "vocês normalizaram as tabelas?" sobre "denormalização relacional"); padronizar a nomenclatura entre corpo do texto e imagem ("esquema lógico").
- [ ] **p47:** "é" → "são" (concordância — verificar qual ocorrência exata); e disponibilizar a documentação da API (Swagger/ReDoc) **nos apêndices**, além de online.
- [ ] **p52:** apresentar a lista de scanners (`comment.ts`, `identifier.ts`, `number.ts`, `string.ts`, `symbol-and-operator.ts`) em **tabela**, mantendo a descrição no corpo do texto.
- [ ] **p57:** verificar se a **Figura 4.5** é a mesma que a **Figura 2.3** — se sim, citar a 2.3 em vez de reapresentá-la.
- [ ] **p58:** deixar claro o contexto dos testes (são feitos a cada novo desenvolvimento/sprint? testam só o atual ou acumulam os anteriores?); disponibilizar os casos de teste **e os resultados** em apêndice e online.
- [ ] **p19/p20/p22/p32:** micro-marcações sem comentário claro (carets "I)", "II)", "s"; "Framework" isolado) — revisar manualmente.
- [ ] **p39:** "qual é a convergência com os sistemas relacionados de compiladores?" — esclarecer no fechamento da proposta.
- [ ] **p54:** "não seria nos trabalhos relacionados?" — **já aplicado** (ver 1).
- [ ] **p61:** "pelo título vejo que essa parte é demanda do seu trabalho" (confirmação do orientador sobre o núcleo do compilador ser sua demanda — coerente com p41).
