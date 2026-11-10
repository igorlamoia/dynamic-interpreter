"""Resume as respostas dos dois formulários de avaliação (PA-01 e demonstração).

Uso (na raiz do repositório):
    uv run --with openpyxl python qualificacao/scripts/analisar-avaliacao.py

Lê as duas planilhas exportadas do Google Forms e grava
qualificacao/verificacao/avaliacao-2026-11/resumo.json.

As planilhas ficam em qualificacao/verificacao/avaliacao-2026-11/dados-brutos/,
pasta ignorada pelo Git: elas trazem a hora de cada envio e todos os textos
livres, e não devem ser publicadas. O resumo gravado traz só o que pode ir a
público: contagens, médias, as respostas abertas cuja citação foi autorizada
e, por respondente, apenas o que os cruzamentos do texto usam.
"""
import json, statistics as st, collections, pathlib, openpyxl

RAIZ = pathlib.Path(__file__).resolve().parents[2]
BRUTOS = RAIZ / "qualificacao/verificacao/avaliacao-2026-11/dados-brutos"
PA01 = BRUTOS / "pa01.xlsx"
DEMO = BRUTOS / "demonstracao.xlsx"
SAIDA = RAIZ / "qualificacao/verificacao/avaliacao-2026-11/resumo.json"

def linhas(arq):
    ws = openpyxl.load_workbook(arq, data_only=True).worksheets[0]
    rows = [r for r in ws.iter_rows(values_only=True) if any(c is not None for c in r)]
    return [str(c).strip() for c in rows[0]], rows[1:]

def rotulo(cab):
    return cab[cab.index("[") + 1: cab.rindex("]")] if "[" in cab else cab

def item(cab, rows, i):
    """Resumo de um item de escala: só valores numéricos entram em n/média/mediana."""
    vals = [r[i] for r in rows]
    nums = [float(v) for v in vals if isinstance(v, (int, float))]
    outros = collections.Counter(str(v) for v in vals if v is not None and not isinstance(v, (int, float)))
    return {
        "item": rotulo(cab[i]), "n": len(nums),
        "media": round(st.mean(nums), 2) if nums else None,
        "mediana": st.median(nums) if nums else None,
        "min": min(nums) if nums else None, "max": max(nums) if nums else None,
        "respostas": [v if not isinstance(v, float) else int(v) for v in vals],
        "sem_resposta": sum(v is None for v in vals), "outros": dict(outros),
    }

# Opções de múltipla escolha que contêm vírgula no próprio rótulo: o Forms
# também separa as marcações por vírgula, então elas são protegidas antes.
COM_VIRGULA = [
    "Scratch, Blockly ou similar", "Beecrowd, URI ou outro juiz online",
    "Thonny, Python Tutor ou outro visualizador de execução", "Usei um preset pronto, sem alterar",
]

def multi(rows, i):
    c = collections.Counter()
    for r in rows:
        if r[i]:
            txt = str(r[i])
            for k, op in enumerate(COM_VIRGULA):
                txt = txt.replace(op, f"@@{k}@@")
            for p in txt.split(", "):
                p = p.strip()
                for k, op in enumerate(COM_VIRGULA):
                    p = p.replace(f"@@{k}@@", op)
                c[p] += 1
    return dict(c.most_common())

NORMALIZA = {"Médio": "Ensino médio"}  # a mesma titulação foi digitada de duas formas

def simples(rows, i):
    rows = [tuple(NORMALIZA.get(str(c).strip(), c) if k == i else c for k, c in enumerate(r)) for r in rows]
    return dict(collections.Counter(str(r[i]).strip() if r[i] is not None else "(sem resposta)" for r in rows).most_common())

# ---------------- PA-01 ----------------
cab, rows = linhas(PA01)
n = len(rows)
def bloco(a, b): return [item(cab, rows, i) for i in range(a, b + 1)]

sus = []
for r in rows:
    v = r[30:40]
    if all(isinstance(x, (int, float)) for x in v):
        s = sum((x - 1) if k % 2 == 0 else (5 - x) for k, x in enumerate(v)) * 2.5
        sus.append(s)
    else:
        sus.append(None)
sus_ok = [s for s in sus if s is not None]

ueq = []
for r in rows:
    v = [x - 4 for x in r[40:48]]
    ueq.append({"pragmatica": round(st.mean(v[:4]), 2), "hedonica": round(st.mean(v[4:]), 2), "geral": round(st.mean(v), 2)})

pa01 = {
    "n": n,
    "periodo": [str(rows[0][0])[:10], str(rows[-1][0])[:10]],
    "perfil": {
        "titulacao": simples(rows, 2), "atuacao": multi(rows, 3), "ferramentas_conhecidas": multi(rows, 4),
        "leciona": simples(rows, 5), "tempo_programacao": simples(rows, 16), "tempo_de_uso": simples(rows, 17),
        "o_que_fez": multi(rows, 18), "o_que_personalizou": multi(rows, 19),
    },
    "uso_em_sala_so_quem_leciona": bloco(6, 14),
    "momento_da_disciplina": simples([r for r in rows if r[15]], 15),
    "recursos": bloco(20, 29),
    "sus": {
        "por_respondente": sus, "n": len(sus_ok), "media": round(st.mean(sus_ok), 1), "mediana": st.median(sus_ok),
        "desvio_padrao": round(st.stdev(sus_ok), 1), "min": min(sus_ok), "max": max(sus_ok),
        "itens": bloco(30, 39),
    },
    "ueq_s": {
        "por_respondente": ueq,
        "pragmatica_media": round(st.mean(u["pragmatica"] for u in ueq), 2),
        "hedonica_media": round(st.mean(u["hedonica"] for u in ueq), 2),
        "geral_media": round(st.mean(u["geral"] for u in ueq), 2),
        "itens_brutos_1a7": bloco(40, 47),
    },
    "potencial_pedagogico": bloco(48, 55),
    "riscos_concordar_e_apontar_problema": bloco(56, 58),
    "qualidade_tecnica": bloco(59, 63),
    "construcoes_que_faltaram": multi(rows, 64),
    "utilidade_intencao_tam": bloco(65, 70),
    "abertas": [
        {"pergunta": cab[i], "respostas": [
            {"respondente": k + 1, "texto": str(r[i]).strip(), "autoriza_citacao": True}
            for k, r in enumerate(rows) if r[i] and str(r[75]).startswith("Sim")]}
        for i in range(71, 75)],
    "autorizacao_citacao": simples(rows, 75),
    # Uso declarado por respondente (R1 a R8, na ordem da planilha), para que os
    # cruzamentos citados no texto possam ser refeitos. Titulação, atuação e tempo
    # de programação ficam só nas contagens do perfil: com oito convidados, a
    # combinação deles permitiria reconhecer quem respondeu.
    "por_respondente": [
        {"r": f"R{k + 1}", "leciona": r[5], "momento_da_disciplina": r[15],
         "tempo_de_uso": r[17],
         "o_que_fez": list(multi([r], 18)), "o_que_personalizou": list(multi([r], 19)),
         "construcoes_que_faltaram": list(multi([r], 64)), "sus": sus[k], "ueq_s": ueq[k]}
        for k, r in enumerate(rows)],
}

# ---------------- Demonstração (alunos) ----------------
cab2, rows2 = linhas(DEMO)
ESC = {"Discordo totalmente": 1, "Discordo": 2, "Não concordo nem discordo": 3, "Concordo": 4, "Concordo totalmente": 5}
likert = []
for i in range(6, 12):
    vals = [ESC[str(r[i]).strip()] for r in rows2]
    c = collections.Counter(vals)
    likert.append({
        "item": rotulo(cab2[i]), "n": len(vals), "media": round(st.mean(vals), 2), "mediana": st.median(vals),
        "distribuicao_1a5": [c.get(k, 0) for k in range(1, 6)],
        "concordam_4ou5": sum(v >= 4 for v in vals), "neutros_3": c.get(3, 0), "discordam_1ou2": sum(v <= 2 for v in vals),
    })
demo = {
    "n": len(rows2), "data": str(rows2[0][0])[:10],
    "horario": [str(rows2[0][0])[11:16], str(rows2[-1][0])[11:16]],
    "assentimento": simples(rows2, 1), "idade": simples(rows2, 2), "curso": simples(rows2, 3), "ano": simples(rows2, 4),
    "experiencia": simples(rows2, 5), "itens": likert,
    "comparacao_versoes": {"legenda": "Versão A = sintaxe padrão em inglês; Versão B = personalizada em português",
                           "respostas": simples(rows2, 12)},
    "comparacao_por_experiencia": {
        exp: dict(collections.Counter(str(r[12]).strip() for r in rows2 if str(r[5]).strip() == exp))
        for exp in simples(rows2, 5)},
    # O formulário dos estudantes não pede autorização de citação: só a contagem é gravada.
    "comentarios_n": sum(1 for r in rows2 if r[13]),
    "por_respondente": [
        {"e": f"E{k + 1}", "experiencia": r[5],
         "itens_1a5": [ESC[str(r[i]).strip()] for i in range(6, 12)], "comparacao": r[12]}
        for k, r in enumerate(rows2)],
}

SAIDA.write_text(json.dumps({"pa01_especialistas": pa01, "demonstracao_alunos": demo}, ensure_ascii=False, indent=1))
print("gravado", SAIDA.relative_to(RAIZ))
