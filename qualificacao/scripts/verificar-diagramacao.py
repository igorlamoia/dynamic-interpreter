"""Verifica A4 retrato e limites dos objetos nos PDFs dos dois TCCs.

Dependência: pdfplumber. Executar da raiz: python qualificacao/scripts/verificar-diagramacao.py
Aceita caminhos de PDFs como argumentos para conferir compilações temporárias.
Não substitui a revisão visual de legibilidade e de sobreposição entre objetos.
"""
import argparse
from collections import Counter
from pathlib import Path

import pdfplumber

PT_POR_MM = 72 / 25.4
TOLERANCIA = 0.5  # pontos PDF: arredondamento de coordenadas/fontes (~0,18 mm).
ROOT = Path(__file__).resolve().parents[1]


def verificar(caminho):
    falhas = 0
    with pdfplumber.open(caminho) as documento:
        for numero, pagina in enumerate(documento.pages, 1):
            esperado = (0, 0, 210 * PT_POR_MM, 297 * PT_POR_MM)
            caixas = (pagina.mediabox, pagina.cropbox or pagina.mediabox)
            if pagina.rotation != 0 or any(
                abs(float(atual) - alvo) > TOLERANCIA
                for caixa in caixas for atual, alvo in zip(caixa, esperado)
            ):
                print(f'{caminho}: página {numero}: formato diferente de A4 retrato.')
                falhas += 1
            esquerda = topo = 30 * PT_POR_MM
            direita = pagina.width - 20 * PT_POR_MM
            fundo = pagina.height - 20 * PT_POR_MM
            fora = Counter()
            for tipo in ('chars', 'images', 'lines', 'rects', 'curves'):
                for objeto in getattr(pagina, tipo):
                    if tipo == 'chars':
                        texto = objeto['text']
                        if not texto.strip():
                            continue
                        # Numeração institucional no cabeçalho, acima da área de texto.
                        if (texto.isdigit() and 40 <= objeto['top'] <= 65
                                and objeto['bottom'] <= 75
                                and direita - 25 <= objeto['x0']
                                and objeto['x1'] <= direita + TOLERANCIA):
                            continue
                    borda = float(objeto.get('linewidth') or 0) / 2 if objeto.get('stroke') else 0
                    if (objeto['x0'] - borda < esquerda - TOLERANCIA
                            or objeto['x1'] + borda > direita + TOLERANCIA
                            or objeto['top'] - borda < topo - TOLERANCIA
                            or objeto['bottom'] + borda > fundo + TOLERANCIA):
                        fora[tipo] += 1
            if fora:
                print(f'{caminho}: página {numero}: objetos fora das margens: {dict(fora)}')
                falhas += 1
        print(f'{caminho}: {len(documento.pages)} páginas; {falhas} ocorrências.')
    return falhas


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdfs', nargs='*', type=Path)
    arquivos = parser.parse_args().pdfs or [ROOT / a / 'TCC_Template.pdf' for a in ('igor', 'victor')]
    return int(sum(verificar(arquivo) for arquivo in arquivos) > 0)


if __name__ == '__main__':
    raise SystemExit(main())
