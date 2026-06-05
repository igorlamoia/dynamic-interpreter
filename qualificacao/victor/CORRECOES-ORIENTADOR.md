# Correções do orientador — registro de ajustes

Documento gerado a partir das anotações de `TCC_I-Victor-corrigido.pdf` (texto-base: `TCC_Template.tex` + `texto/*.tex`).

> **Nota:** as marcações sobre citações ("não é suficiente para eliminar as citações ao longo do texto. Portanto, a cada trecho que remete a uma citação esta deverá ser adequadamente referenciada", além de "é uma citação? qual a fonte?", "referência?", "Segundo Fulano (ano)", "reforce a citação com Pressman ou Sommervile") **NÃO** foram tratadas aqui — serão resolvidas depois.

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
- [x] `\indent` no resumo (recuo de parágrafo)
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
- [ ] **p40:** falta abordar **retenção/dificuldade em programação** no referencial teórico (sugestão: olhar publicações do PET.COMP sobre retenção em programação/algoritmos e usar as referências delas).
- [ ] **p27:** cuidado metodológico com **Scrum** — é necessário equipe com tamanho mínimo para que cada papel seja exercido (conforme o manifesto); se estiver adotando Scrum metodologicamente, rever ("a Gabriella vai bater forte").
- [ ] **p41 (IMPORTANTE):**
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
