import type { IdeIntl } from "../../types/ide";

const ide: IdeIntl = {
  files: {
    main: `// FICHEIRO PRINCIPAL
//
// Este e o ponto de entrada do programa.
//
// Usa este ficheiro para escrever e testar programas
// com a linguagem que estas a criar.
`,

    token: `// TOKENS E LEXEMAS
//
// Um token e uma categoria reconhecida pela linguagem.
//
// Exemplos:
// NUMBER
// IDENTIFIER
// PLUS
// IF
//
// Um lexema e o texto real encontrado no codigo-fonte.
//
// Exemplo:
//
// idade + 10
//
// "idade" -> IDENTIFIER
// "+"     -> PLUS
// "10"    -> NUMBER
//
// Token  = categoria
// Lexema = texto encontrado no codigo
`,

    lexer: `// ANALISADOR LEXICO
//
// O lexer le o codigo-fonte e transforma-o
// numa sequencia de tokens.
//
// Exemplo:
//
// inteiro idade = 20;
//
// pode gerar:
//
// KEYWORD("inteiro")
// IDENTIFIER("idade")
// ASSIGN("=")
// NUMBER("20")
// SEMICOLON(";")
//
// Fluxo:
//
// Codigo-fonte
//      |
//    Lexer
//      |
//    Tokens
`,

    expr: `// EXPRESSOES
//
// Uma expressao e uma construcao que pode ser avaliada
// e normalmente produz um valor.
//
// Exemplos:
//
// 10
//
// idade
//
// 10 + 5
//
// idade >= 18
//
// soma(10, 20)
//
// Uma expressao pode conter outras expressoes.
//
// Exemplo:
//
// 10 + 5
//
//      +
//     / \\
//   10   5
`,

    stmt: `// STATEMENTS / INSTRUCOES
//
// Uma instrucao representa uma accao executada pelo programa.
//
// Exemplos:
//
// print("Ola")
//
// idade = 20
//
// if idade >= 18 {
//   print("Maior de idade")
// }
//
// Uma forma simples de diferenciar:
//
// EXPRESSAO
//
// idade >= 18
//      |
//    true
//
// INSTRUCAO
//
// print("Ola")
//      |
// executa uma accao
`,

    grammar: `// GRAMATICA
//
// A gramatica define como os elementos da linguagem
// podem ser combinados.
//
// Ela determina quais estruturas sao codigo valido.
//
// Exemplo simplificado:
//
// expression :=
//     number
//   | identifier
//   | expression operator expression
//
// ifStatement :=
//   "if" expression block
//
// O lexer identifica tokens.
// A gramatica define como esses tokens podem ser organizados.
`,

    parser: `// PARSER
//
// O parser recebe os tokens produzidos pelo lexer
// e verifica se eles seguem as regras da gramatica.
//
// Fluxo:
//
// Codigo
//   |
// Lexer
//   |
// Tokens
//   |
// Parser
//   |
// AST
//
// Exemplo:
//
// 10 + 5
//
// Tokens:
//
// NUMBER PLUS NUMBER
//
// Resultado:
//
// BinaryExpression
`,

    ast: `// ABSTRACT SYNTAX TREE - AST
//
// A AST representa a estrutura do programa
// em forma de arvore.
//
// Codigo:
//
// x = 10 + 5
//
// Representacao:
//
// Assignment
// |-- Identifier: x
// \`-- BinaryExpression
//     |-- Number: 10
//     |-- Operator: +
//     \`-- Number: 5
//
// A AST preserva a estrutura necessaria
// para compreender e executar o programa.
`,

    types: `// TIPOS
//
// Tipos representam diferentes categorias de valores.
//
// Exemplos:
//
// inteiro
// decimal
// texto
// booleano
//
// O sistema de tipos tambem determina quais operacoes
// podem ser realizadas entre valores.
`,

    scope: `// AMBITO
//
// O ambito determina onde variaveis, funcoes
// e outros identificadores podem ser usados.
//
// Exemplo:
//
// {
//   inteiro idade = 20
// }
//
// Dependendo das regras da linguagem,
// "idade" pode nao existir fora desse bloco.
//
// Ambitos sao importantes para:
//
// - variaveis
// - funcoes
// - parametros
// - blocos
`,

    semantic: `// ANALISE SEMANTICA
//
// Um codigo pode estar sintaticamente correcto
// e ainda assim ter um significado invalido.
//
// Exemplo:
//
// 10 + "Ola"
//
// A estrutura pode ser aceite pela gramatica,
// mas a linguagem pode proibir a soma entre
// numero e texto.
//
// A analise semantica pode verificar:
//
// - compatibilidade de tipos
// - existencia de variaveis
// - regras de ambito
// - chamadas de funcoes
// - regras especificas da linguagem
`,

    emitter: `// REPRESENTACAO INTERMEDIA - IR
//
// O emitter transforma a estrutura analisada do programa
// numa representacao intermedia.
//
// Fluxo:
//
// AST
//  |
// Emitter
//  |
// IR
//  |
// Interpreter
//
// A IR pode simplificar a execucao do programa.

export {};
`,

    interpreter: `// INTERPRETADOR
//
// O interpretador executa o programa.
//
// Pode ser responsavel por:
//
// - avaliar expressoes
// - executar instrucoes
// - armazenar variaveis
// - controlar ambitos
// - executar condicoes
// - executar ciclos
// - chamar funcoes
//
// Fluxo:
//
// IR / AST
//    |
// Interpreter
//    |
// Resultado

export {};
`,

    lexerSpec: `// TESTES DO LEXER
//
// Este ficheiro pode ser usado para testar
// se o analisador lexico reconhece correctamente
// os tokens da linguagem.
//
// Exemplo:
//
// entrada:
//
// idade + 10
//
// esperado:
//
// IDENTIFIER
// PLUS
// NUMBER

export {};
`,

    readme: `# Dynamic Interpreter

Este projecto representa uma linguagem criada no Dynamic Interpreter.

## Como um programa e interpretado

\`\`\`text
Codigo-fonte
     |
Lexer
     |
Tokens
     |
Parser
     |
AST
     |
Analise Semantica
     |
IR
     |
Interpretador
     |
Resultado
\`\`\`

## Estrutura do projecto

### grammar

Contem os elementos responsaveis pelas regras sintaticas da linguagem.

### parser

Transforma tokens numa estrutura que representa o programa.

### semantics

Responsavel por tipos, ambitos e validacoes semanticas.

### ir

Representa as etapas proximas da execucao.

## Conceitos importantes

### Token

Categoria reconhecida pelo lexer.

### Lexema

Texto real encontrado no codigo-fonte.

### Expressao

Construcao que normalmente produz um valor.

### Statement

Instrucao executada pelo programa.

### AST

Representacao estrutural do programa.

### Analise semantica

Verifica se o codigo possui significado valido segundo as regras da linguagem.
`,
  },
};

export default ide;
