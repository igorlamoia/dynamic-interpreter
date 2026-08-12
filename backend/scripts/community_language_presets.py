"""Presets oficiais publicados no catálogo comunitário pelo seed.

Os valores espelham os presets oferecidos pelo wizard do frontend. Cada
customização é completa para que uma linguagem importada do catálogo possa ser
usada imediatamente pelo lexer, pelo editor e pelo visualizador de DNA.
"""

from dataclasses import dataclass
from typing import Any


TOKEN_IDS = {
    "int": 21,
    "float": 22,
    "bool": 55,
    "string": 23,
    "void": 49,
    "for": 24,
    "while": 25,
    "break": 26,
    "continue": 27,
    "if": 28,
    "else": 29,
    "return": 30,
    "print": 33,
    "scan": 35,
    "switch": 50,
    "case": 51,
    "default": 52,
    "variavel": 62,
    "funcao": 63,
}


@dataclass(frozen=True)
class CommunityLanguagePreset:
    name: str
    description: str
    preset_id: str
    mappings: dict[str, str]
    operator_word_map: dict[str, str]
    boolean_literal_map: dict[str, str]
    statement_terminator_lexeme: str
    block_delimiters: dict[str, str]
    modes: dict[str, str]

    def customization(self) -> dict[str, Any]:
        return {
            "mappings": [
                {
                    "original": original,
                    "custom": self.mappings[original],
                    "tokenId": token_id,
                }
                for original, token_id in TOKEN_IDS.items()
            ],
            "operatorWordMap": dict(self.operator_word_map),
            "booleanLiteralMap": dict(self.boolean_literal_map),
            "statementTerminatorLexeme": self.statement_terminator_lexeme,
            "blockDelimiters": dict(self.block_delimiters),
            "modes": dict(self.modes),
            "languageDocumentation": {},
        }


PT_OPERATORS = {
    "logical_or": "ou",
    "logical_and": "e",
    "logical_not": "nao",
    "less": "menor",
    "less_equal": "menor_ou_igual",
    "greater": "maior",
    "greater_equal": "maior_ou_igual",
    "equal_equal": "igual",
    "not_equal": "diferente",
}


COMMUNITY_LANGUAGE_PRESETS = (
    CommunityLanguagePreset(
        name="Didática em Português",
        description=(
            "Vocabulário em português, tipagem explícita e blocos marcados por "
            "início e fim. Ideal para os primeiros passos em programação."
        ),
        preset_id="didactic-pt",
        mappings={
            "int": "numero_inteiro",
            "float": "numero_real",
            "bool": "logico",
            "string": "texto",
            "void": "vazio",
            "for": "para",
            "while": "enquanto",
            "break": "pare",
            "continue": "continue",
            "if": "se",
            "else": "senao",
            "return": "retorne",
            "print": "escreva",
            "scan": "leia",
            "switch": "escolha",
            "case": "caso",
            "default": "padrao",
            "variavel": "variavel",
            "funcao": "funcao",
        },
        operator_word_map=PT_OPERATORS,
        boolean_literal_map={"true": "verdadeiro", "false": "falso"},
        statement_terminator_lexeme=";",
        block_delimiters={"open": "inicio", "close": "fim"},
        modes={
            "semicolon": "required",
            "block": "delimited",
            "typing": "typed",
            "array": "fixed",
        },
    ),
    CommunityLanguagePreset(
        name="Pythonica",
        description=(
            "Sintaxe leve inspirada em Python, com blocos por indentação, "
            "tipagem flexível e arrays dinâmicos."
        ),
        preset_id="python-like",
        mappings={
            "int": "numero",
            "float": "decimal",
            "bool": "flag",
            "string": "texto",
            "void": "nada",
            "for": "para",
            "while": "enquanto",
            "break": "sai",
            "continue": "segue",
            "if": "se",
            "else": "senao",
            "return": "retorne",
            "print": "imprime",
            "scan": "le",
            "switch": "match",
            "case": "case",
            "default": "padrao",
            "variavel": "nome",
            "funcao": "defina",
        },
        operator_word_map=PT_OPERATORS,
        boolean_literal_map={"true": "verdadeiro", "false": "falso"},
        statement_terminator_lexeme="",
        block_delimiters={"open": "", "close": ""},
        modes={
            "semicolon": "optional-eol",
            "block": "indentation",
            "typing": "untyped",
            "array": "dynamic",
        },
    ),
    CommunityLanguagePreset(
        name="Minimalista",
        description=(
            "Uma linguagem compacta, com palavras-chave curtas, tipagem flexível "
            "e foco em escrever programas com o mínimo de ruído."
        ),
        preset_id="minimal",
        mappings={
            "int": "i",
            "float": "f",
            "bool": "b",
            "string": "s",
            "void": "_",
            "for": "fr",
            "while": "wh",
            "break": "br",
            "continue": "ct",
            "if": "if_",
            "else": "el",
            "return": "rt",
            "print": "out",
            "scan": "in",
            "switch": "sw",
            "case": "cs",
            "default": "df",
            "variavel": "var",
            "funcao": "fn",
        },
        operator_word_map={
            "logical_or": "ou",
            "logical_and": "e",
            "logical_not": "nao",
            "less": "lt",
            "less_equal": "lte",
            "greater": "gt",
            "greater_equal": "gte",
            "equal_equal": "eq",
            "not_equal": "neq",
        },
        boolean_literal_map={"true": "tr", "false": "fa"},
        statement_terminator_lexeme="",
        block_delimiters={"open": "{", "close": "}"},
        modes={
            "semicolon": "optional-eol",
            "block": "delimited",
            "typing": "untyped",
            "array": "dynamic",
        },
    ),
    CommunityLanguagePreset(
        name="Ruby-like",
        description=(
            "Vocabulário expressivo inspirado em Ruby, com tipagem flexível, "
            "arrays dinâmicos e blocos delimitados por palavras."
        ),
        preset_id="ruby-like",
        mappings={
            "int": "num",
            "float": "decimal",
            "bool": "bool",
            "string": "str",
            "void": "nil",
            "for": "for_each",
            "while": "while_do",
            "break": "break_loop",
            "continue": "next_loop",
            "if": "if_then",
            "else": "else_branch",
            "return": "return_value",
            "print": "puts",
            "scan": "gets",
            "switch": "case_of",
            "case": "when_case",
            "default": "otherwise",
            "variavel": "var",
            "funcao": "def",
        },
        operator_word_map={
            "logical_or": "or_word",
            "logical_and": "and_word",
            "logical_not": "not_word",
            "less": "lt",
            "less_equal": "lte",
            "greater": "gt",
            "greater_equal": "gte",
            "equal_equal": "eq",
            "not_equal": "neq",
        },
        boolean_literal_map={"true": "true_word", "false": "false_word"},
        statement_terminator_lexeme="",
        block_delimiters={"open": "inicio", "close": "fim"},
        modes={
            "semicolon": "optional-eol",
            "block": "delimited",
            "typing": "untyped",
            "array": "dynamic",
        },
    ),
    CommunityLanguagePreset(
        name="Minerês",
        description=(
            "Uma linguagem bem-humorada inspirada no falar mineiro, com tipagem "
            "explícita, blocos delimitados e terminador próprio."
        ),
        preset_id="mineres-like",
        mappings={
            "int": "trem_di_numeru",
            "float": "trem_cum_virgula",
            "bool": "trem_discolhe",
            "string": "trem_discrita",
            "void": "trem_de_nada",
            "for": "roda_esse_trem",
            "while": "enquanto_tiver_trem",
            "break": "para_o_trem",
            "continue": "toca_o_trem",
            "if": "uai_se",
            "else": "uai_senao",
            "return": "ta_bao",
            "print": "oia_proce_ve",
            "scan": "xove",
            "switch": "dependenu",
            "case": "du_casu",
            "default": "deixa_assim",
            "variavel": "trem",
            "funcao": "bora_cumpade",
        },
        operator_word_map={
            "logical_or": "quarque_um",
            "logical_and": "tamem",
            "logical_not": "vam_marca",
            "less": "menor",
            "less_equal": "menor_ou_igual",
            "greater": "maior",
            "greater_equal": "maior_ou_igual",
            "equal_equal": "mema_coisa",
            "not_equal": "neh_nada",
        },
        boolean_literal_map={"true": "eh", "false": "num_eh"},
        statement_terminator_lexeme="uai",
        block_delimiters={"open": "simbora", "close": "cabo"},
        modes={
            "semicolon": "required",
            "block": "delimited",
            "typing": "typed",
            "array": "fixed",
        },
    ),
)
