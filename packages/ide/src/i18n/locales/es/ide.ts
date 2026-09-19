import type { IdeIntl } from "../../types/ide";

const ide: IdeIntl = {
  files: {
    main: `// ARCHIVO PRINCIPAL
//
// Este es el punto de entrada del programa.
//
// Usa este archivo para escribir y probar programas
// con el lenguaje que estas creando.
`,

    token: `// TOKENS Y LEXEMAS
//
// Un token es una categoria reconocida por el lenguaje.
//
// Ejemplos:
// NUMBER
// IDENTIFIER
// PLUS
// IF
//
// Un lexema es el texto real encontrado en el codigo fuente.
//
// Ejemplo:
//
// edad + 10
//
// "edad" -> IDENTIFIER
// "+"    -> PLUS
// "10"   -> NUMBER
//
// Token  = categoria
// Lexema = texto encontrado en el codigo
`,

    lexer: `// ANALIZADOR LEXICO
//
// El lexer lee el codigo fuente y lo transforma
// en una secuencia de tokens.
//
// Ejemplo:
//
// entero edad = 20;
//
// puede generar:
//
// KEYWORD("entero")
// IDENTIFIER("edad")
// ASSIGN("=")
// NUMBER("20")
// SEMICOLON(";")
//
// Flujo:
//
// Codigo fuente
//      |
//    Lexer
//      |
//    Tokens
`,

    expr: `// EXPRESIONES
//
// Una expresion es una construccion que puede evaluarse
// y normalmente produce un valor.
//
// Ejemplos:
//
// 10
//
// edad
//
// 10 + 5
//
// edad >= 18
//
// suma(10, 20)
//
// Una expresion puede contener otras expresiones.
//
// Ejemplo:
//
// 10 + 5
//
//      +
//     / \\
//   10   5
`,

    stmt: `// SENTENCIAS / INSTRUCCIONES
//
// Una instruccion representa una accion ejecutada por el programa.
//
// Ejemplos:
//
// print("Hola")
//
// edad = 20
//
// if edad >= 18 {
//   print("Mayor de edad")
// }
//
// Una forma simple de diferenciar:
//
// EXPRESION
//
// edad >= 18
//      |
//    true
//
// INSTRUCCION
//
// print("Hola")
//      |
// ejecuta una accion
`,

    grammar: `// GRAMATICA
//
// La gramatica define como se pueden combinar
// los elementos del lenguaje.
//
// Determina que estructuras son codigo valido.
//
// Ejemplo simplificado:
//
// expression :=
//     number
//   | identifier
//   | expression operator expression
//
// ifStatement :=
//   "if" expression block
//
// El lexer identifica tokens.
// La gramatica define como esos tokens pueden organizarse.
`,

    parser: `// PARSER
//
// El parser recibe los tokens producidos por el lexer
// y verifica si siguen las reglas de la gramatica.
//
// Flujo:
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
// Ejemplo:
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
// El AST representa la estructura del programa
// como un arbol.
//
// Codigo:
//
// x = 10 + 5
//
// Representacion:
//
// Assignment
// |-- Identifier: x
// \`-- BinaryExpression
//     |-- Number: 10
//     |-- Operator: +
//     \`-- Number: 5
//
// El AST conserva la estructura necesaria
// para entender y ejecutar el programa.
`,

    types: `// TIPOS
//
// Los tipos representan diferentes categorias de valores.
//
// Ejemplos:
//
// entero
// decimal
// texto
// booleano
//
// El sistema de tipos tambien determina que operaciones
// pueden realizarse entre valores.
`,

    scope: `// ALCANCE
//
// El alcance determina donde variables, funciones
// y otros identificadores pueden usarse.
//
// Ejemplo:
//
// {
//   entero edad = 20
// }
//
// Segun las reglas del lenguaje,
// "edad" puede no existir fuera de este bloque.
//
// Los alcances son importantes para:
//
// - variables
// - funciones
// - parametros
// - bloques
`,

    semantic: `// ANALISIS SEMANTICO
//
// Un codigo puede ser sintacticamente correcto
// y aun asi tener un significado invalido.
//
// Ejemplo:
//
// 10 + "Hola"
//
// La estructura puede ser aceptada por la gramatica,
// pero el lenguaje puede prohibir sumar
// un numero y texto.
//
// El analisis semantico puede verificar:
//
// - compatibilidad de tipos
// - existencia de variables
// - reglas de alcance
// - llamadas a funciones
// - reglas especificas del lenguaje
`,

    emitter: `// REPRESENTACION INTERMEDIA - IR
//
// El emitter transforma la estructura analizada del programa
// en una representacion intermedia.
//
// Flujo:
//
// AST
//  |
// Emitter
//  |
// IR
//  |
// Interpreter
//
// La IR puede simplificar la ejecucion del programa.

export {};
`,

    interpreter: `// INTERPRETE
//
// El interprete ejecuta el programa.
//
// Puede encargarse de:
//
// - evaluar expresiones
// - ejecutar instrucciones
// - almacenar variables
// - controlar alcances
// - ejecutar condiciones
// - ejecutar bucles
// - llamar funciones
//
// Flujo:
//
// IR / AST
//    |
// Interpreter
//    |
// Resultado

export {};
`,

    lexerSpec: `// PRUEBAS DEL LEXER
//
// Este archivo puede usarse para probar
// si el analizador lexico reconoce correctamente
// los tokens del lenguaje.
//
// Ejemplo:
//
// entrada:
//
// edad + 10
//
// esperado:
//
// IDENTIFIER
// PLUS
// NUMBER

export {};
`,

    readme: `# Dynamic Interpreter

Este proyecto representa un lenguaje creado en Dynamic Interpreter.

## Como se interpreta un programa

\`\`\`text
Codigo fuente
     |
Lexer
     |
Tokens
     |
Parser
     |
AST
     |
Analisis Semantico
     |
IR
     |
Interprete
     |
Resultado
\`\`\`

## Estructura del proyecto

### grammar

Contiene los elementos responsables de las reglas sintacticas del lenguaje.

### parser

Transforma tokens en una estructura que representa el programa.

### semantics

Responsable de tipos, alcances y validaciones semanticas.

### ir

Representa las etapas cercanas a la ejecucion.

## Conceptos importantes

### Token

Categoria reconocida por el lexer.

### Lexema

Texto real encontrado en el codigo fuente.

### Expresion

Construccion que normalmente produce un valor.

### Statement

Instruccion ejecutada por el programa.

### AST

Representacion estructural del programa.

### Analisis semantico

Verifica si el codigo tiene significado valido segun las reglas del lenguaje.
`,
  },
};

export default ide;
