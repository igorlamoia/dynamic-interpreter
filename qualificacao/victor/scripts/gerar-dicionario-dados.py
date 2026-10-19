"""Gera a documentação do esquema a partir dos modelos, sem conectar ao banco.

Executar da raiz do repositório:
    backend/.venv/bin/python qualificacao/victor/scripts/gerar-dicionario-dados.py
"""
from itertools import permutations
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'backend'))

from sqlalchemy.dialects import postgresql
import app.models  # noqa: F401: registra as onze tabelas em Base.metadata.
from app.db.base import Base

VOLUME = ROOT / 'qualificacao/victor'


def escape(value):
    return str(value).replace('\\', r'\textbackslash{}').replace('_', r'\_\allowbreak{}').replace('%', r'\%').replace('&', r'\&').replace('#', r'\#')


def code(value):
    return r'\texttt{' + escape(value) + '}'


tables = sorted(Base.metadata.tables.values(), key=lambda table: table.name)
rows = [r'''% Gerado por scripts/gerar-dicionario-dados.py. Não editar manualmente.
\chapter[APÊNDICE D -- DICIONÁRIO DE DADOS]{\parbox{0.9\textwidth}{\centering APÊNDICE D \textendash{} DICIONÁRIO DE DADOS}}
\label{ap:dicionario-dados}

Este apêndice documenta os modelos SQLAlchemy de \texttt{backend/app/models}, sem consultar um banco em execução. Os tipos são apresentados para o dialeto PostgreSQL. PK identifica chave primária; FK, chave estrangeira; UQ, unicidade; e a coluna Nulo informa se o atributo admite valor nulo. Os valores enumerados, as restrições compostas e os índices declarados são registrados após cada tabela. Uma FK sem ação de exclusão explicitada não equivale a uma cascata de exclusão no banco.

O relacionamento ORM de submissão com publicação utiliza os identificadores de lista e turma, mas não declara uma FK composta correspondente. Cascatas definidas apenas por \texttt{relationship} pertencem ao ORM, não às restrições SQL listadas aqui. A tabela técnica \texttt{alembic\_version}, mantida pelo Alembic, não integra o conjunto de entidades de domínio.
''']
for table in tables:
    rows += [r'\section*{'+code(table.name)+'}', r'\begingroup\footnotesize', r'\setlength{\tabcolsep}{4pt}\renewcommand{\arraystretch}{1.15}', r'\begin{longtable}{|>{\raggedright\arraybackslash}p{\dimexpr.28\linewidth-2\tabcolsep\relax}|>{\raggedright\arraybackslash}p{\dimexpr.23\linewidth-2\tabcolsep\relax}|>{\raggedright\arraybackslash}p{\dimexpr.09\linewidth-2\tabcolsep\relax}|>{\raggedright\arraybackslash}p{\dimexpr.40\linewidth-2\tabcolsep-5\arrayrulewidth\relax}|}',r'\hline', r'\textbf{Atributo} & \textbf{Tipo} & \textbf{Nulo} & \textbf{Chaves e referências} \\ \hline',r'\endfirsthead',r'\hline \textbf{Atributo} & \textbf{Tipo} & \textbf{Nulo} & \textbf{Chaves e referências} \\ \hline',r'\endhead']
    for column in table.columns:
        keys = []
        if column.primary_key:
            keys.append('PK')
        if column.unique:
            keys.append('UQ')
        for fk in sorted(column.foreign_keys, key=lambda item: item.target_fullname):
            text = 'FK: ' + code(fk.target_fullname)
            if fk.ondelete:
                text += '; exclusão: ' + code(fk.ondelete)
            keys.append(text)
        rows.append(' & '.join([code(column.name), code(column.type.compile(dialect=postgresql.dialect())), 'Sim' if column.nullable else 'Não', '; '.join(keys) or '--']) + r' \\ \hline')
    rows += [r'\end{longtable}']
    notes = []
    for column in table.columns:
        values = getattr(column.type, 'enums', None)
        if values:
            notes.append(code(column.name)+': '+', '.join(code(v) for v in values)+'.')
    for constraint in sorted(table.constraints, key=lambda c: (type(c).__name__, str(c.name))):
        kind = type(constraint).__name__
        columns = ', '.join(code(c.name) for c in constraint.columns)
        if kind == 'PrimaryKeyConstraint' and len(constraint.columns)>1:
            notes.append('Chave primária composta: '+columns+'.')
        elif kind == 'UniqueConstraint' and len(constraint.columns)>1:
            notes.append('Unicidade conjunta: '+columns+'.')
        elif kind == 'CheckConstraint':
            notes.append('Restrição '+code(constraint.name)+': '+code(constraint.sqltext)+'.')
    for index in sorted(table.indexes, key=lambda i: i.name):
        notes.append('Índice '+code(index.name)+' sobre '+', '.join(code(c.name) for c in index.columns)+'.')
    if notes:
        rows += [r'\begin{itemize}', *[r'\item '+note for note in notes], r'\end{itemize}']
    rows += [r'\endgroup', '']
(VOLUME/'texto/dicionario-dados.tex').write_text('\n'.join(rows).rstrip()+'\n')

# Modelo lógico em notação de pé de galinha: cada tabela mostra suas colunas de chave
# (PK, FK, UQ) e cada linha liga a coluna FK à chave primária referenciada.
# Os demais atributos estão no apêndice.
W, ROW, GAP = 5.4, 0.5, 1.0
columns_x = [0.0, 7.6, 15.2]
# Disposição obtida por busca local que minimiza cruzamentos; o número após cada
# tabela é o espaço extra acima dela, em centímetros.
layout = [
    [('exercise_list_items', 1.0), ('exercises', 0.5), ('test_cases', 0.5), ('languages', 2.0)],
    [('class_exercise_lists', 0), ('submissions', 0.5), ('exercise_lists', 1.5), ('users', 0.5)],
    [('classes', 2.0), ('class_members', 1.0), ('organizations', 0)],
]
assert {name for column in layout for name, _ in column} == {table.name for table in tables}, 'Atualize o layout para as novas tabelas.'
gutters = {0: (-1.0, 0.0), 1: (W, columns_x[1]), 2: (columns_x[1] + W, columns_x[2]), 3: (columns_x[2] + W, columns_x[2] + W + 1.0)}

def plain(value):
    return r'\texttt{' + str(value).replace('_', r'\_') + '}'


def key_label(column):
    keys = (['PK'] if column.primary_key else []) + (['FK'] if column.foreign_keys else []) + (['UQ'] if column.unique else [])
    return ', '.join(keys)


row_y, boxes, rows_by_table, column_of = {}, {}, {}, {}
by_name = {table.name: table for table in tables}
for index, column_tables in enumerate(layout):
    top = 0.0
    for name, extra in column_tables:
        table, x = by_name[name], columns_x[index]
        top -= extra
        shown = [c for c in table.columns if key_label(c)]
        rows_by_table[name], column_of[name] = shown, index
        for i, column in enumerate(shown):
            row_y[(name, column.name)] = top - ROW * (i + 1) - ROW / 2
        height = ROW * (len(shown) + 1 + (len(table.columns) > len(shown)))
        boxes[name] = (x, top, x + W, top - height)
        top -= height + GAP

edges = []
for table in tables:
    for column in table.columns:
        for fk in sorted(column.foreign_keys, key=lambda f: f.target_fullname):
            edges.append({'src': table.name, 'col': column.name, 'dst': fk.column.table.name, 'pk': fk.column.name,
                          'optional': column.nullable})
for edge in edges:
    # Tabelas na mesma coluna usam um dos corredores laterais; colunas vizinhas, o corredor entre elas.
    a, b = column_of[edge['src']], column_of[edge['dst']]
    assert abs(a - b) <= 1, 'Referência entre colunas não vizinhas: ' + edge['src'] + ' -> ' + edge['dst']
    edge['options'] = (a, a + 1) if a == b else (max(a, b),)
fk_count = len(edges)


def side_x(table, gutter):
    x1, _, x2, _ = boxes[table]
    return x2 if gutters[gutter][0] >= x2 else x1


def place(members, gutter, lanes):
    """Pontos de cada FK de um corredor, dadas as pistas de cada chave de destino."""
    segs = []
    for edge in members:
        key = (edge['dst'], side_x(edge['dst'], gutter))
        y1, y2 = row_y[(edge['src'], edge['col'])], row_y[(edge['dst'], edge['pk'])]
        edge['points'] = [(side_x(edge['src'], gutter), y1), (lanes[key], y1), (lanes[key], y2), (side_x(edge['dst'], gutter), y2)]
        segs += [(key, a, b) for a, b in zip(edge['points'], edge['points'][1:]) if a != b]
    return segs


def crossings_of(segs):
    total = 0
    for i, (k1, a1, b1) in enumerate(segs):
        for k2, a2, b2 in segs[i + 1:]:
            if k1 == k2:
                continue
            h1, h2 = a1[1] == b1[1], a2[1] == b2[1]
            if h1 != h2:
                (ha, hb), (va, vb) = ((a1, b1), (a2, b2)) if h1 else ((a2, b2), (a1, b1))
                if min(ha[0], hb[0]) < va[0] < max(ha[0], hb[0]) and min(va[1], vb[1]) < ha[1] < max(va[1], vb[1]):
                    total += 1
            elif h1 and a1[1] == a2[1] and max(min(a1[0], b1[0]), min(a2[0], b2[0])) < min(max(a1[0], b1[0]), max(a2[0], b2[0])):
                total += 10
            elif not h1 and a1[0] == a2[0] and max(min(a1[1], b1[1]), min(a2[1], b2[1])) < min(max(a1[1], b1[1]), max(a2[1], b2[1])):
                total += 10
    return total


def best_lanes(members, gutter):
    """Ordem das pistas de um corredor com menos cruzamentos; empate favorece linhas curtas."""
    keys = sorted({(e['dst'], side_x(e['dst'], gutter)) for e in members})
    start, end = gutters[gutter]
    step = (end - start) / (len(keys) + 1)
    result = None
    for order in permutations(keys):
        lanes = {k: start + step * (i + 1) for i, k in enumerate(order)}
        segs = place(members, gutter, lanes)
        score = (crossings_of(segs), sum(abs(b[0] - a[0]) + abs(b[1] - a[1]) for _, a, b in segs))
        if result is None or score < result[0]:
            result = (score, lanes)
    return result


def evaluate(combo):
    plan, score = {}, (0, 0)
    for gutter in gutters:
        members = [e for e, g in zip(edges, combo) if g == gutter]
        if members:
            for e in members:
                e['gutter'] = gutter
            (c, length), lanes = best_lanes(members, gutter)
            plan[gutter] = lanes
            score = (score[0] + c, score[1] + length)
    return score, list(combo), plan


best = evaluate([edge['options'][0] for edge in edges])
for _ in range(2):
    for i, edge in enumerate(edges):
        for option in edge['options']:
            trial = evaluate(best[1][:i] + [option] + best[1][i + 1:])
            if trial[0] < best[0]:
                best = trial
(crossings, _), combo, plan = best
groups = {}
for edge, gutter in zip(edges, combo):
    edge['gutter'] = gutter
    groups.setdefault((gutter, edge['dst'], side_x(edge['dst'], gutter)), []).append(edge)
assert all(len({e['optional'] for e in members}) == 1 for members in groups.values()), 'Grupo com FKs obrigatórias e opcionais.'
for gutter, lanes in plan.items():
    place([e for e in edges if e['gutter'] == gutter], gutter, lanes)


def fmt(point):
    return f'({point[0]:.2f},{point[1]:.2f})'


fig = [r'% Gerado por scripts/gerar-dicionario-dados.py. Não editar manualmente.',
       r'\pgfdeclarearrow{name=CF many0,setup code={\pgfarrowssettipend{0pt}\pgfarrowssetlineend{0pt}\pgfarrowssetbackend{-13pt}\pgfarrowshullpoint{0pt}{3.5pt}\pgfarrowshullpoint{0pt}{-3.5pt}\pgfarrowshullpoint{-13pt}{0pt}},drawing code={\pgfsetdash{}{0pt}\pgfpathmoveto{\pgfpoint{0pt}{3.5pt}}\pgfpathlineto{\pgfpoint{-7pt}{0pt}}\pgfpathlineto{\pgfpoint{0pt}{-3.5pt}}\pgfusepathqstroke\pgfpathcircle{\pgfpoint{-10pt}{0pt}}{2.4pt}\pgfsetfillcolor{white}\pgfusepathqfillstroke}}%',
       r'\pgfdeclarearrow{name=CF one,setup code={\pgfarrowssettipend{0pt}\pgfarrowssetlineend{0pt}\pgfarrowssetbackend{-8pt}\pgfarrowshullpoint{0pt}{3.5pt}\pgfarrowshullpoint{-8pt}{-3.5pt}},drawing code={\pgfsetdash{}{0pt}\pgfpathmoveto{\pgfpoint{-4pt}{3.5pt}}\pgfpathlineto{\pgfpoint{-4pt}{-3.5pt}}\pgfpathmoveto{\pgfpoint{-7pt}{3.5pt}}\pgfpathlineto{\pgfpoint{-7pt}{-3.5pt}}\pgfusepathqstroke}}%',
       r'\pgfdeclarearrow{name=CF one0,setup code={\pgfarrowssettipend{0pt}\pgfarrowssetlineend{0pt}\pgfarrowssetbackend{-12pt}\pgfarrowshullpoint{0pt}{3.5pt}\pgfarrowshullpoint{-12pt}{-3.5pt}},drawing code={\pgfsetdash{}{0pt}\pgfpathmoveto{\pgfpoint{-4pt}{3.5pt}}\pgfpathlineto{\pgfpoint{-4pt}{-3.5pt}}\pgfusepathqstroke\pgfpathcircle{\pgfpoint{-9pt}{0pt}}{2.4pt}\pgfsetfillcolor{white}\pgfusepathqfillstroke}}%',
       r'\resizebox{\linewidth}{!}{%',
       r'\begin{tikzpicture}[font=\footnotesize,'
       r'cell/.style={draw=black!70,anchor=north west,minimum width=' + f'{W}' + r'cm,text width=' + f'{W - 0.28:.2f}' + r'cm,minimum height=' + f'{ROW}' + r'cm,inner xsep=0.14cm,inner ysep=0pt,align=left,fill=white},'
       r'head/.style={cell,fill=black!12,align=center},'
       r'rel/.style={semithick,draw=black!80,line join=round,preaction={draw=white,line width=2.6pt,-}}]']
for key, members in groups.items():
    for edge in members:
        points = [p for i, p in enumerate(edge['points']) if i == 0 or p != edge['points'][i - 1]]
        tip = 'CF one0' if edge['optional'] else 'CF one'
        fig.append(r'\draw[rel,{CF many0}-{' + tip + '}] ' + ' -- '.join(fmt(p) for p in points) + ';')
    # Ponto de junção onde mais de uma referência segue pela mesma pista.
    lane = plan[key[0]][key[1:]]
    ys = sorted({row_y[(e['src'], e['col'])] for e in members} | {row_y[(members[0]['dst'], members[0]['pk'])]})
    for y in ys[1:-1]:
        fig.append(rf'\fill[black!80] ({lane:.2f},{y:.2f}) circle (2pt);')
for table in tables:
    x, top, _, bottom = boxes[table.name]
    fig.append(rf'\node[head] at ({x:.2f},{top:.2f}) {{{plain(table.name)}}};')
    for i, column in enumerate(rows_by_table[table.name]):
        label = r'\makebox[1.3cm][l]{\textsf{\scriptsize ' + key_label(column) + '}}' + plain(column.name)
        fig.append(rf'\node[cell] at ({x:.2f},{top - ROW * (i + 1):.2f}) {{{label}}};')
    rest = len(table.columns) - len(rows_by_table[table.name])
    if rest:
        fig.append(rf'\node[cell,text=black!60] at ({x:.2f},{bottom + ROW:.2f}) {{\makebox[1.3cm][l]{{}}\textit{{+{rest} atributo{"s" if rest > 1 else ""}}}}};')
    fig.append(rf'\draw[semithick] ({x:.2f},{top:.2f}) rectangle ({x + W:.2f},{bottom:.2f});')
legend_y = min(box[3] for box in boxes.values()) - 0.9
fig += [
    rf'\draw[rel,-{{CF one}}] (0,{legend_y:.2f}) -- ++(1,0) node[right,black] {{exatamente um}};',
    rf'\draw[rel,-{{CF one0}}] (4.2,{legend_y:.2f}) -- ++(1,0) node[right,black] {{zero ou um (FK opcional)}};',
    rf'\draw[rel,-{{CF many0}}] (10.4,{legend_y:.2f}) -- ++(1,0) node[right,black] {{zero ou muitos}};',
    rf'\fill[black!80] (15.0,{legend_y:.2f}) circle (2pt) node[right,black,xshift=1pt] {{junção de referências à mesma chave}};',
    r'\end{tikzpicture}}',
]
(VOLUME/'Figuras/esquema-banco-atual.tex').write_text('\n'.join(fig)+'\n')
print(f'{len(tables)} tabelas, {sum(len(t.columns) for t in tables)} atributos, {fk_count} chaves estrangeiras documentadas; {crossings} cruzamentos na figura.')
