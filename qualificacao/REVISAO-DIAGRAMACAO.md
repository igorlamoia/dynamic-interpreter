# Revisão de diagramação dos dois TCCs — 16/09/2026

Os PDFs em `igor/TCC_Template.pdf` e `victor/TCC_Template.pdf` foram recompilados
após a revisão das margens. Esta revisão atualiza a paginação registrada nos
relatórios anteriores de correções da banca; não altera a avaliação dos demais
apontamentos desses relatórios.

## Ajustes

- Todas as páginas em A4 retrato (210 × 297 mm), sem rotação de páginas.
- Margens do modelo: 3 cm acima e à esquerda, 2 cm abaixo e à direita. Removido
  o arredondamento da altura da área de texto feito pelo `memoir`; reservados
  3 pt adicionais na base para a extensão visual dos glifos da última linha.
  Desativada a projeção de pontuação para fora das margens pelo `microtype`.
- Tabela comparativa em retrato, com colunas proporcionais à área útil,
  cabeçalho repetido e continuação entre páginas. Preservados os conteúdos
  das seis ferramentas de cada versão.
- Casos de uso separados em acesso/IDE e participação/gestão pedagógica,
  preservando os 22 casos, as associações e as duas generalizações de cada TCC.
- Diagrama do banco de Victor reorganizado em retrato, preservando as onze
  tabelas e 21 referências. O gerador também foi atualizado; o dicionário de
  81 atributos permanece inalterado.
- Listagens com espaçamento simples, espaço para numeração e moldura dentro
  das margens e configuração de flutuação persistente, evitando a divisão
  dos trechos atuais entre páginas.
- Cronogramas com posicionamento automático para não excederem a altura
  disponível ao coexistir com outros elementos na mesma página.

## Verificação

| Documento | Páginas do PDF | A4 retrato | Objetos fora das margens |
| --- | ---: | --- | ---: |
| Igor | 93 | Todas | 0 |
| Victor | 81 | Todas | 0 |

As duas compilações terminaram sem `Overfull`, figuras/listagens grandes demais
ou referências indefinidas. Foram inspecionadas visualmente as páginas dos
diagramas, comparativos, cronograma, folha de aprovação e amostras de listagens.
A comparação dos fontes confirmou a preservação dos casos de uso, associações,
referências do banco e conteúdo das linhas comparativas.

O verificador examina as caixas de página, rotação, caracteres, imagens e objetos
vetoriais de todas as páginas. Considera a espessura dos traços e uma tolerância
de 0,5 ponto PDF (aproximadamente 0,18 mm) para arredondamento; a numeração no
cabeçalho é tratada separadamente. Não avalia sobreposição interna, legibilidade
ou conformidade integral com todas as regras acadêmicas.

Para repetir a compilação e a verificação, com LaTeX/latexmk e o módulo Python
`pdfplumber` instalados, executar da raiz do repositório:

```sh
latexmk -cd -pdf -interaction=nonstopmode -halt-on-error -outdir=/tmp/tcc-layout-igor qualificacao/igor/TCC_Template.tex
latexmk -cd -pdf -interaction=nonstopmode -halt-on-error -outdir=/tmp/tcc-layout-victor qualificacao/victor/TCC_Template.tex
python qualificacao/scripts/verificar-diagramacao.py /tmp/tcc-layout-igor/TCC_Template.pdf /tmp/tcc-layout-victor/TCC_Template.pdf
```

Sem argumentos, o verificador examina os dois PDFs versionados no repositório.

## Revalidação após a atualização do conteúdo — 17/09/2026

A [sincronização dos textos com o código](ATUALIZACAO-CODIGO-2026-09-17.md)
alterou a paginação para **96 páginas no Igor** e **84 no Victor**. Os dois PDFs
foram recompilados sem `Overfull`, figuras grandes demais ou referências
indefinidas. As 180 páginas passaram novamente na verificação de formato e
limites dos objetos, sem ocorrências fora das margens; as páginas novas de
conteúdo e tabelas também foram inspecionadas visualmente.

## TCC do Igor após os merges de testes E2E — 19/09/2026

A atualização do referencial, da metodologia e das considerações do Igor,
com novas referências bibliográficas, resultou em **103 páginas** no PDF.
A compilação final terminou sem `Overfull`, figuras grandes demais ou
referências indefinidas. O verificador encontrou **zero ocorrências** nas
103 páginas A4, com as margens de 3 cm acima/à esquerda e 2 cm abaixo/à direita.
Foram conferidas visualmente a nova tabela, a discussão dos testes e do CI,
os resultados locais e as referências. O PDF do Victor não foi alterado
nesta revisão e conserva as 84 páginas da atualização anterior.

Os [resultados de testes e suas limitações](igor/verificacao/README.md)
acompanham o texto, com [registro estruturado](igor/verificacao/testes-2026-09-19.json).
