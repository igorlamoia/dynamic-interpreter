# Correções da banca — Igor

Revisão realizada em **12/09/2026** sobre `qualificacao/igor/`. Fonte: [Qualificacao_Correcoes_Gabi.pdf](Qualificacao_Correcoes_Gabi.pdf), com **119 anotações** em 79 páginas (85 realces, 27 riscados e 7 notas), contadas diretamente nos objetos do PDF. A numeração abaixo é a do inventário do [plano original](../PLANO-CORRECOES-QUALIFICACAO.md).

O texto foi corrigido e recompilado. **Isso não significa que todos os requisitos da aplicação ou a avaliação pedagógica estejam concluídos.** Há barreiras de acessibilidade comprovadas na verificação, e o estudo com estudantes permanece uma proposta. Nenhuma aprovação ética, entrevista ou resultado de aprendizagem foi presumido.

Esta revisão substitui, para o texto do Igor, os estados antigos do plano que presumiam acessibilidade pelas bibliotecas ou apresentavam datas de acesso inferidas. Os documentos do Victor e os rascunhos em `tcc/` não foram alterados nesta rodada.

## Conferência das 119 anotações

As linhas agrupam pedidos relacionados. “Atendido no texto” significa que a crítica editorial ou a necessidade de descrição foi tratada; não equivale a certificar o sistema ou a validar uma hipótese científica.

| Anotações | Pedido | Situação | Evidência / tratamento |
|---|---|---|---|
| 001 | Definição de dinâmico | Atendido no texto | Introdução delimita configuração por execução e distingue variantes implementadas de gramáticas arbitrárias. A escolha final do título ainda pode ser revista com os orientadores. |
| 002, 003, 004, 005, 006 | IDE em caixa alta e titulação | Atendido no texto | Preambulo preserva a sigla e ajusta a folha de aprovação; Prof. Me. mantido. |
| 007, 008 | Objetivo e escopo do resumo | Atendido no texto | Resumo e abstract reescritos com foco na IDE, contribuição conjunta e resultados técnicos, sem resultados de alunos. |
| 009, 011, 046, 077, 095, 096, 097 | Margens e identificadores | Atendido no texto | Compilação final sem Overfull ou figuras maiores que a página; lista de figuras e páginas centrais inspecionadas. |
| 010, 037, 038, 054 | Hierarquia do referencial | Atendido no texto | Engenharia de Software é seção própria; execução de máquina está em Compiladores; títulos aprofundados foram evitados. |
| 012, 013, 014 | Identificação do texto complementar | Atendido no texto | Autor, título e divisão de responsabilidades explicitados na introdução e no apêndice. |
| 015, 029, 030, 031, 032, 033, 034, 035, 036, 039, 041, 042, 044, 045, 048, 050, 052, 055, 059, 063, 065, 067, 070, 072, 073 | Parágrafos genéricos de atribuição | Atendido no texto | Parágrafos riscados removidos; referências vinculadas às afirmações a que dão suporte. |
| 016, 017, 018, 021 | Argumentação e fontes | Atendido no texto | Removidas generalizações sobre taxas, predominância das ferramentas e benefícios não demonstrados; recorte comparativo explicitado. |
| 019, 020 | Pergunta e hipótese | Atendido no texto | Pergunta investiga contribuição; hipótese explicitamente não verificada com estudantes. |
| 022, 023, 027, 057, 060 | Medidas de UX/UI e estudo previsto | Proposta documentada; aplicação futura | Seção de protocolo relaciona cinco tarefas, recursos, critérios observáveis, ficha de registro e questionário próprio; coleta não realizada. |
| 024, 025, 026 | Objetivos específicos | Atendido no texto | Metas descrevem especificação, implementação, integração, disponibilização e proposta de avaliação. |
| 028 | Considerações finais | Atendido no texto | Capítulo revisto para o estado do TCC II, com objetivos, resultados técnicos, limites e continuidade. |
| 040 | Espaçamento após aspas | Atendido no texto | Aspas e espaçamento da passagem revisados no referencial. |
| 043, 047, 080, 085 | Método aplicado | Atendido no texto | Desenvolvimento incremental e práticas parciais de XP; removidas garantias de TDD universal e de execução de testes no fluxo de implantação. |
| 049 | Padrões e organização | Atendido no texto | Contexts/Provider e hooks como interfaces de acesso descritos; não se atribuem padrões do núcleo sem demonstração no texto. |
| 051 | Formulação de qualidade de código | Atendido no texto | Expressão “de maneira ágil e sustentável” mantida. |
| 053 | Runtime adotado | Atendido no texto | Pages Router e Node.js descritos; referencial de Next.js substituído por documentação oficial pertinente à implementação. |
| 056, 083 | Itálico em estrangeirismos | Atendido no texto | Design e tokens tratados em itálico no texto; nomes literais do código permanecem nas listagens. |
| 058 | Efeito estética-usabilidade | Atendido no texto | Trecho removido; aparência não é usada como evidência de usabilidade ou aprendizagem. |
| 061, 062, 064, 066, 068, 069, 071, 074 | Trabalhos relacionados | Atendido no texto | Dois grupos e três eixos preservados; autoria de Stefik e Siebert explicitada; comparativo, Laila, Quorum, Beecrowd e Webstudio revisados com fontes primárias. |
| 075, 078, 086, 092 | Casos de uso e requisitos | Atendido no texto | Diagrama contém 22 casos de uso, acompanhado de 20 RF e 8 RNF. Uso local por visitante e vínculo de linguagem a listas incluídos; perfis do código explicados como capacidades de atores. |
| 076 | Possibilidades de personalização | Atendido no texto | Tabela com exemplos e restrições revisada; variantes GrammarConfig explicadas, incluindo tipagem e arranjos. |
| 079 | Cronograma | Atendido no texto | Atividades alinhadas com integração, testes e preparação de protocolo; marcações preservadas como planejamento, sem inventar execução histórica. |
| 081 | Base comum | Atendido no texto | Parágrafo identifica construção conjunta e eixos individuais; apêndice detalha a divisão. |
| 082 | Avaliação com pessoas e ética | Encaminhamento institucional pendente | Protocolo registra ausência de aplicação e necessidade de definir recrutamento, consentimento, dados e encaminhamento institucional. Não há aprovação ou cronograma de submissão inventado. |
| 084, 099 | WAI-ARIA e método de verificação | Verificação parcial; barreiras na aplicação | Referencial distingue semântica ARIA e critérios WCAG; inspeção de código e verificação real em navegador documentadas, incluindo falhas e itens inconclusivos. |
| 087 | Mapa do capítulo | Atendido no texto | Abertura referencia arquitetura, interface, testes e protocolo. |
| 088, 090 | Arquitetura | Atendido no texto | Figura atual identifica navegador, núcleo compartilhado, servidor Next.js, FastAPI e PostgreSQL; texto corrige contradição sobre execução no servidor. |
| 089, 091 | Persistência e coesão | Atendido no texto | Mantida descrição da responsabilidade de persistência e da separação em diretórios como primeiro passo, sem alegação de coesão garantida. |
| 093, 094 | Listagens e recuo | Atendido no texto | Listagens flutuantes inteiras, com separação de parágrafos. Compilação sem listagem maior que página. |
| 098 | Exemplos visuais | Atendido no texto | Capturas atuais do mesmo assistente em 1440 e 390 pixels, com explicação de reorganização; capturas claras também arquivadas. |
| 100 | Telas por funcionalidades | Atendido no texto | Agrupamento com identificadores RF mantido; capturas de seis etapas identificadas como históricas diante das sete etapas atuais. |
| 101 | Tamanho das imagens | Atendido no texto | Largura disponível utilizada com limite de altura para manter figura completa na página; captura móvel conserva proporção. |
| 102, 103, 104 | Divisão de figuras e espaços | Atendido no texto | Figuras desmembradas, sem ContinuedFloat; agrupamentos de uma única subfigura tornaram-se figuras independentes. |
| 105, 106 | Pirâmide e exemplos de testes | Atendido no texto | Conceito no referencial; exemplo de armazenamento identificado como recorte. 120 testes da configuração padrão e 6 casos adicionais executados. |
| 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119 | Bibliografia | Atendido no texto | Dados e datas das fontes efetivamente consultadas atualizados; fontes genéricas/inferidas de blogs removidas com os trechos substituídos. Laila corrigida. Lista completa de autores mantida nas entradas pertinentes. |

## Resultados verificáveis

- **126 testes aprovados** no total dos comandos desta revisão: 120 em 27 arquivos selecionados pela configuração padrão da IDE; mais 6 em dois arquivos executados separadamente. Não é uma contagem da cobertura total do repositório.
- **Quatro cenários de interface**: 1440×1000 e 390×844 pixels CSS, temas claro e escuro, usuário sem sessão. Transição entre duas etapas realizada por teclado; direção das etapas e largura de rolagem verificadas.
- **Problemas encontrados:** botão sem nome acessível, contraste, título ausente, link sem nome no celular, elementos interativos aninhados, regiões roláveis sem foco e alvo pequeno. Há também resultados inconclusivos. Contagens e seletores estão no [JSON da verificação](verificacao/interface-2026-09-12.json).
- PDF recompilado com 94 páginas, usando LaTeX/BibTeX; log sem referências ou citações indefinidas, rótulos duplicados, caixas excedentes ou figuras maiores que a página. Foram inspecionados visualmente exemplos de diagrama, capturas, tabelas e protocolo.
- [Procedimento e ambiente de reprodução](verificacao/README.md), incluindo o ajuste de Node.js necessário aos testes de armazenamento e as limitações do recorte.

## O que ainda precisa acontecer

1. Corrigir as barreiras na **aplicação**, ampliar a inspeção aos fluxos completos e verificar leitor de tela, foco, contraste e internacionalização. Esta rodada corrige o TCC e documenta os achados; não modifica componentes da IDE.
2. Revisar a proposta de avaliação com os orientadores, definir amostra e instrumentos e estabelecer o encaminhamento institucional aplicável antes de recrutar participantes. Não existe resultado empírico que permita concluir ganho de aprendizagem.
3. Atualizar as capturas históricas das demais funcionalidades à medida que a interface estabilizar para a defesa. A versão de seis etapas está identificada como histórica; as capturas novas mostram as sete etapas atuais.
4. Integrar testes ao fluxo de incorporação de mudanças. O workflow versionado apenas chama o script externo de implantação e não comprova execução de Vitest.

## Fontes consultadas nesta revisão

- [W3C — WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/) e [WCAG 2.2](https://www.w3.org/TR/WCAG22/): semântica, comportamento e critérios de verificação.
- [Radix — Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility): recursos e responsabilidade da composição dos componentes.
- [Norman e Nielsen — Definition of User Experience](https://www.nngroup.com/articles/definition-user-experience/): distinção entre UX, UI e usabilidade.
- [Next.js — Pages Router](https://nextjs.org/docs/pages) e [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes): arquitetura efetivamente utilizada.
- [Portugol Studio](https://univali-lite.github.io/Portugol-Studio/) e [Portugol Webstudio](https://github.com/dgadelha/Portugol-Webstudio): projetos distintos e recursos de cada ambiente.
- [Quorum](https://quorumlanguage.com/) e [CSTA — Quorum Studio](https://csteachers.org/learn-about-the-new-quorum-studio/): finalidade e acessibilidade do ecossistema.
- [Beecrowd — FAQs Problems](https://judge.beecrowd.com/en/faqs/about/problems): ciclo de submissão e exemplos de entrada/saída.
- [Laila — documento do IFCE](https://gestaoaracati.ifce.edu.br/attachments/download/2699/tcc.pdf): título, autores e alcance do questionário com 17 respostas.
- [chibicc — repositório do autor](https://github.com/rui314/chibicc): construção incremental e testes.
- [FastAPI — documentação](https://fastapi.tiangolo.com/): validação e documentação da API.

As datas de acesso das referências consultadas são 12/09/2026. As referências restantes conservam os dados anteriores; não se inferiu uma nova data para livros ou fontes não reconsultadas.
