import type { IdeIntl } from "../../types/ide";

const ide: IdeIntl = {
  files: {
    main: `// ARQUIVO PRINCIPAL
//
// Este e o ponto de entrada do programa.
//
// Use este arquivo para escrever e testar programas
// usando a linguagem que voce criou.
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
// O lexer le o codigo-fonte e o transforma
// em uma sequencia de tokens.
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
// Uma instrucao representa uma acao executada pelo programa.
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
// executa uma acao
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
// para entender e executar o programa.
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

    scope: `// ESCOPO
//
// O escopo determina onde variaveis, funcoes
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
// Escopos sao importantes para:
//
// - variaveis
// - funcoes
// - parametros
// - blocos
`,

    semantic: `// ANALISE SEMANTICA
//
// Um codigo pode estar sintaticamente correto
// e ainda assim ter um significado invalido.
//
// Exemplo:
//
// 10 + "Ola"
//
// A estrutura pode ser aceita pela gramatica,
// mas a linguagem pode proibir a soma entre
// numero e texto.
//
// A analise semantica pode verificar:
//
// - compatibilidade de tipos
// - existencia de variaveis
// - regras de escopo
// - chamadas de funcoes
// - regras especificas da linguagem
`,

    emitter: `// REPRESENTACAO INTERMEDIARIA - IR
//
// O emitter transforma a estrutura analisada do programa
// em uma representacao intermediaria.
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
// Ele pode ser responsavel por:
//
// - avaliar expressoes
// - executar instrucoes
// - armazenar variaveis
// - controlar escopos
// - executar condicoes
// - executar lacos
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
// Este arquivo pode ser usado para testar
// se o analisador lexico reconhece corretamente
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

Este projeto representa uma linguagem criada no Dynamic Interpreter.

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

## Estrutura do projeto

### grammar

Contem os elementos responsaveis pelas regras sintaticas da linguagem.

### parser

Transforma tokens em uma estrutura que representa o programa.

### semantics

Responsavel por tipos, escopos e validacoes semanticas.

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
