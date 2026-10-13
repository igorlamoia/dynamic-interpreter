import type { CompilerRulesIntl } from "../../types/compiler-rules";

const compilerRules: CompilerRulesIntl = {
  title: "Compiler language rules",
  description:
    "The practical rules that matter when writing code for this compiler.",
  close: "Close",
  sections: [
    {
      title: "Program shape",
      items: [
        "A program is made of function declarations.",
        "Execution starts at main.",
        "Typed mode functions start with a return type; untyped functions start with function.",
        "Function bodies can be one statement or a block.",
      ],
      code: `int main() {
  return 0;
}

function main() {
  return 0;
}`,
    },
    {
      title: "Blocks and statement endings",
      items: [
        "if, else, while, and for can use a single statement body without braces.",
        "Use delimiters when the body has multiple statements.",
        "Semicolons are always valid statement terminators.",
        "Optional-EOL mode allows valid line or block boundaries to end statements.",
        "Same-line consecutive statements still need a terminator.",
      ],
      code: `if (ready) print("ok");

if (ready) {
  print("start");
  print("done");
}

int b = 1; print(b);`,
    },
    {
      title: "Input, output, and updates",
      items: [
        "print accepts zero or more expressions.",
        "Typed scan requires a type or format hint; untyped scan uses only the target variable.",
        "scan targets must be assignable variables or valid array elements.",
        "Assignments, compound assignments, prefix updates, and postfix updates are accepted.",
        "Increment and decrement work for scalar variables, not array elements.",
      ],
      code: `scan(int, x);
scan("%f", price);
scan(name);

x += value;
++x;
x--;`,
    },
    {
      title: "Typed mode",
      items: [
        "Typed mode is the default.",
        "Variable types are int, float, bool, and string.",
        "Function return types add void, which is only valid for returns.",
        "Multiple scalar declarations and per-variable initialization are accepted.",
        "A trailing initializer applies to previous uninitialized scalar names in the same declaration.",
      ],
      code: `int a = 1, b = 2, c = 3;
bool hasX, hasY = false;
int a, b, c = 7;`,
    },
    {
      title: "Arrays",
      items: [
        "Fixed arrays use positive integer sizes; dynamic arrays use empty brackets.",
        "Fixed array access must match the declared number of dimensions.",
        "Dynamic arrays may grow on write.",
        "Reading a dynamic array position that was never written raises a runtime error.",
        "Arrays passed to functions are passed by reference.",
      ],
      code: `int values[2];
int matrix[2][3];
int dynamicValues[];

void edit(int matrix[2][2]) {
  matrix[0][0] = 99;
}`,
    },
    {
      title: "Array literals",
      items: [
        "Array literals are accepted only during declaration or initialization.",
        "They are not accepted in normal assignment.",
        "Fixed literals must match the declared size and nesting depth.",
        "Typed literal values must be compatible with the array base type.",
      ],
      code: `int values[2] = [0, 1];
int matrix[2][2] = [[0, 1], [2, 3]];

values = [0, 1]; // invalid`,
    },
    {
      title: "Untyped mode",
      items: [
        "Untyped mode uses function, variable, and parameters without types.",
        "Multiple scalar declarations and trailing initializers work like typed mode.",
        "Arrays can be declared with variable.",
        "Shorthand array declarations require an array literal initializer.",
      ],
      code: `function sum(a, b) {
  variable total = a + b;
  return total;
}

variable list[];
list[] = [0, 1];`,
    },
  ],
};

export default compilerRules;
