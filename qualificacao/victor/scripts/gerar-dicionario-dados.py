"""Gera a documentação do esquema a partir dos modelos, sem conectar ao banco.

Executar da raiz do repositório:
    backend/.venv/bin/python qualificacao/victor/scripts/gerar-dicionario-dados.py
"""
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

# Visão de relacionamentos: uma seta por FK; os atributos completos estão no apêndice.
positions = {
    'organizations': (0, 0), 'users': (7, 0), 'languages': (14, 0),
    'classes': (0, -4), 'submissions': (7, -4), 'exercises': (14, -4),
    'class_members': (0, -8), 'class_exercise_lists': (4.5, -8),
    'exercise_lists': (9, -8), 'exercise_list_items': (14, -8),
    'test_cases': (19, -4),
}
assert set(positions) == {table.name for table in tables}, 'Atualize o layout para as novas tabelas.'
node_ids = {name:'n'+str(i) for i,name in enumerate(positions)}
fig = [r'% Gerado por scripts/gerar-dicionario-dados.py.',r'\resizebox{0.90\linewidth}{!}{%',r'\begin{tikzpicture}[entity/.style={draw,rounded corners,fill=white,align=center,text width=3.2cm,minimum height=1.25cm,inner sep=6pt,font=\small},fk/.style={-{Latex},semithick,draw=black!70}]']
for table in tables:
    x,y = positions[table.name]
    label = code(table.name)
    fig.append(r'\node[entity] ('+node_ids[table.name]+f') at ({x},{y}) '+'{'+label+r'\\'+str(len(table.columns))+' atributos};')
fig.append(r'\begin{scope}[on background layer]')
fk_count = 0
for table in tables:
    for column in table.columns:
        for fk in sorted(column.foreign_keys, key=lambda f:f.target_fullname):
            start,end=node_ids[table.name],node_ids[fk.column.table.name]
            fk_count += 1
            if start==end:
                edge=r'\draw[fk] ('+start+r') to[loop above,min distance=18mm] ('+end+');'
            elif table.name=='users' and column.name=='active_language_id':
                edge=r'\draw[fk] ('+start+r') to[bend left=25] ('+end+');'
            elif table.name=='exercise_lists' and fk.column.table.name=='users':
                edge=r'\draw[fk] ('+start+r'.north) -- (9,-6.3) -- (4.8,-6.3) -- (4.8,-1.6) -- ('+end+'.south west);'
            elif table.name=='exercise_lists' and fk.column.table.name=='languages':
                edge=r'\draw[fk] ('+start+r'.south) -- (9,-9.6) -- (17,-9.6) -- (17,0) -- ('+end+'.east);'
            elif table.name=='class_members' and fk.column.table.name=='users':
                edge=r'\draw[fk] ('+start+r'.west) -- (-2.4,-8) -- (-2.4,2.4) -- (7,2.4) -- ('+end+'.north);'
            else:
                edge=r'\draw[fk] ('+start+') -- ('+end+');'
            fig.append(edge)
fig += [r'\end{scope}',r'\node[font=\small,align=left,anchor=north west] at (-2,-10.3) {Cada seta parte da tabela que contém a FK e aponta para a tabela referenciada.\\Setas em sentidos opostos entre usuários e linguagens representam propriedade e linguagem ativa.\\A autorreferência de linguagens registra sua origem por clonagem.};',r'\end{tikzpicture}}']
(VOLUME/'Figuras/esquema-banco-atual.tex').write_text('\n'.join(fig)+'\n')
print(f'{len(tables)} tabelas, {sum(len(t.columns) for t in tables)} atributos, {fk_count} chaves estrangeiras documentadas.')
