# Compiler And Interpreter Rules

This document records the current language rules verified from the lexer,
parser, and tests in `src/tests`.

## Runtime Configuration

The compiler is split into lexer rules and grammar rules.

Lexer options change which lexemes become tokens:

| Option | Rule |
| --- | --- |
| `statementTerminatorLexeme` | Adds another statement terminator lexeme. The configured lexeme is tokenized as the same token type as `;`. |
| `blockDelimiters: { open, close }` | Adds word-based block delimiters. The configured `open` word is tokenized like `{`; the configured `close` word is tokenized like `}`. |
| `indentationBlock: true` | Enables indentation tokens: `NEWLINE`, `INDENT`, and `DEDENT`. |
| `tabWidth` | Sets the column width for tabs in indentation mode. Default is `4`. |
| `operatorWordMap` | Adds word aliases for logical and relational operators. |
| `booleanLiteralMap` | Adds word aliases for `true` and `false`. |
| `customKeywords` | Adds or overrides keyword token mappings. |

Grammar options change how the parser accepts token streams:

| Option | Values | Default | Rule |
| --- | --- | --- | --- |
| `semicolonMode` | `optional-eol`, `required` | `optional-eol` | Controls whether statements can end by line boundary or must use a terminator. |
| `blockMode` | `delimited`, `indentation` | `delimited` | Controls whether blocks use delimiters or indentation. |
| `typingMode` | `typed`, `untyped` | `typed` | Typed mode uses typed declarations/functions. Untyped mode uses `funcao` and `variavel`. |
| `arrayMode` | `fixed`, `dynamic` | fixed behavior when arrays are parsed | Fixed arrays require sizes. Dynamic arrays use empty brackets. |

## Statement Terminators

Normal statements can be terminated by the default semicolon `;`.

When `statementTerminatorLexeme` is configured, that lexeme is an additional
terminator. It does not replace the default semicolon for normal statements.

Example with a symbolic terminator:

```java
int main() {
  print(1)@@
  print(2);
}
```

Example with a word terminator:

```java
int main() {
  print(1) uai
  print(2);
}
```

In `semicolonMode: "required"`, each statement that needs a terminator must end
with either `;` or the configured terminator.

In `semicolonMode: "optional-eol"`, a statement can also end at:

- a newline after the previous token,
- a `NEWLINE` token in indentation mode,
- a `DEDENT` token in indentation mode,
- a closing block delimiter, such as `}` or a configured close delimiter.

Same-line consecutive statements still need an explicit terminator:

```java
int main() {
  int a = 1 print(a); // invalid
  int b = 1; print(b); // valid
}
```

`statementTerminatorLexeme` cannot be empty, contain whitespace, reuse `;`,
reuse fixed operator/symbol characters, or conflict with reserved words, custom
keywords, operator aliases, boolean aliases, or configured block delimiters.

The semicolons inside `for` headers are special separators. They must remain
literal `;`; a configured terminator is not accepted there.

```java
int main() {
  for (int i = 0; i < 3; i++) {
    print(i)@@
  }
}
```

## Blocks

In `blockMode: "delimited"`, blocks use `{` and `}`.

When `blockDelimiters` is configured, the configured words are aliases for the
same brace tokens. The default braces are still accepted, so both styles can be
mixed in the same source.

```java
int main() begin
  if (1 == 1) {
    print("ok");
  }
end
```

Configured block delimiters must be identifier-like words, must be different
from each other, and cannot reuse reserved keywords.

`blockDelimiters` cannot be combined with `indentationBlock: true`.

In `blockMode: "indentation"`, blocks use `:` followed by an indented body:

```java
int main():
  print("start")
  if (1 < 2):
    print("nested")
```

Indentation mode rejects:

- brace-based blocks,
- mixed tabs and spaces in the same indentation prefix,
- child blocks that jump more than one inferred indentation level,
- sibling lines that do not align to a known block depth,
- later blocks that use a different indentation unit.

Blank lines and comment-only lines do not create indentation structure.

## Switch

`switch` accepts both block styles, depending on `blockMode`.

Delimited mode:

```java
switch (x) {
  case 1:
    print("one");
    break;
  default:
    print("other");
}
```

Indentation mode:

```java
switch(x):
  case 1:
    print("one")
    break
  default:
    print("other")
```

Case labels can be integer, octal, hexadecimal, or string literals.

```java
case 1:
case 01:
case 0x1:
case "one":
```

Duplicate case labels are rejected. Numeric labels are normalized, so `1`,
`01`, and `0x1` count as the same case value. String labels are compared as
strings, so `"1"` is different from numeric `1`.

The parser allows at most one `default` label. The current parser accepts
`default` in any position inside the switch block, but only one `default` is
allowed.

`case` and `default` outside a `switch` are errors.

## Switch Break And Fallthrough

Switch uses C-style fallthrough semantics.

A `break` is not required at the end of each `case`. If a case body does not
execute `break`, execution continues into the next case or default body in
source order.

```java
switch (x) {
  case 1:
    print("a");
  case 2:
    print("b");
    break;
}
```

When `x` is `1`, this prints both `"a"` and `"b"`.

`break` inside a switch jumps to the end of the nearest breakable context. If a
loop is nested inside a switch, `break` inside that loop exits the loop. If a
switch is nested inside a loop, `break` inside the switch exits the switch.

`continue` is only valid for loops. A `continue` inside a switch targets the
nearest surrounding loop, not the switch itself. If there is no surrounding
loop, `continue` is an error.

## Typed And Untyped Modes

In `typingMode: "typed"`, functions use typed signatures and declarations:

```java
int main() {
  int x = 1;
  return x;
}
```

In `typingMode: "untyped"`, functions use `funcao` and variables use
`variavel`; values are treated as dynamic:

```java
funcao main() {
  variavel x = 1;
  print(x)
}
```

Typed declarations support `int`, `float`, `bool`, and `string`. Function
return types also support `void`.

## Arrays

Fixed array declarations require integer sizes:

```java
int values[2][4];
```

Dynamic array declarations use empty brackets:

```java
variavel values[][] = [[1], [2]];
```

Fixed array access must provide exactly the declared number of dimensions.
Dynamic array access can provide the declared number of dimensions or more.

Arrays passed to functions are passed by reference, so writes in the callee are
visible to the caller.
