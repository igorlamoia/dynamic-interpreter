const ui = {
  line: "Linha",
  column: "Coluna",
  lexeme: "Lexema",
  token_selected: "Você selecionou este token: {lexeme}",
  run_all: "Executar",
  run_lexer: "Executar Análise Léxica",
  hero_title: "Interpretador dinâmico",
  hero_description: "Crie sua própria linguagem de programação",
  lexer_title: "Analisador Léxico",
  lexer_description:
    "O analisador léxico é a primeira etapa do processo de compilação, responsável por converter o código-fonte em uma sequência de tokens. Ele identifica palavras-chave, identificadores, literais e outros elementos do código, facilitando a análise sintática subsequente.",
  interpreter_title: "Interpretador",
  interpreter_description:
    "O interpretador é a etapa final do processo de compilação, responsável por executar o código Java gerado a partir do código TypeScript. Ele interpreta as instruções Java e as executa, permitindo que os desenvolvedores vejam os resultados de seu código TypeScript convertido em Java.",
  total_tokens: "Tokens Gerados",
  show_tokens: "Mostrar Tokens",
  sequence_tokens: "Tokens em Sequência",
  type_tokens: "Tokens por Tipo",
  intermediate_code_title: "Código Intermediário - Linha do Tempo de Execução",
  intermediate_code_description:
    "O código intermediário é uma representação abstrata do código-fonte, que fica entre o código-fonte original e o código de máquina final. Ele é gerado após a análise sintática e antes da geração de código, permitindo otimizações e análises adicionais antes da execução final.",
  login: "Entrar",
  // Validation error messages
  validation_empty_word: "A palavra não pode ser vazia.",
  validation_invalid_word_format:
    "Use apenas letras, números e underscore (começando com letra ou underscore).",
  validation_boolean_literal_conflict:
    '"{value}" já está sendo usada como literal booleano.',
  validation_keyword_already_used:
    '"{value}" já está sendo usada para "{original}".',
  validation_fill_delimiters:
    "Preencha os delimitadores de abertura e fechamento.",
  validation_invalid_delimiter_format:
    "Use palavras válidas (letras, números e _, sem espaços).",
  validation_delimiters_must_differ:
    "Os delimitadores de abertura e fechamento devem ser diferentes.",
  validation_delimiters_reserved:
    "Delimitadores não podem reutilizar palavras reservadas.",
  validation_fill_boolean_literals: "Preencha os literais true e false.",
  validation_invalid_boolean_literal_format:
    "Use palavras válidas para literais booleanos (letras, números e _).",
  validation_boolean_literals_must_differ:
    "Os literais booleanos precisam ser diferentes.",
  validation_conflicts_keyword_customization:
    '"{value}" conflita com uma customização de palavra-chave existente.',
  validation_conflicts_operator_alias:
    '"{value}" conflita com um alias de operador existente.',
  validation_conflicts_boolean_literal_alias:
    '"{value}" conflita com um alias de literal booleano existente.',
  validation_conflicts_block_delimiters:
    '"{value}" conflita com os delimitadores de bloco configurados.',
  validation_fill_statement_terminator: "Informe um terminador.",
  validation_terminator_no_spaces: "O terminador não pode conter espaços.",
  validation_terminator_not_semicolon: "Escolha um terminador diferente de ;.",
  validation_terminator_reserved_chars:
    "O terminador não pode reutilizar símbolos ou operadores fixos da linguagem.",
  validation_operator_invalid_format:
    "Use palavras válidas para operadores (letras, números e _).",
  validation_operator_already_used:
    '"{value}" já está sendo usado por outro alias de operador.',
};

export default ui;
