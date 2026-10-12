"use client";

import { BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompilerRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ruleSections = [
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
    title: "Control flow",
    items: [
      "Accepted statements include if, else, while, for, switch, case, default, break, continue, and return.",
      "break works in loops and switches.",
      "continue only works inside loops.",
      "switch falls through until break or the switch ends.",
      "Duplicate case labels are rejected, including equivalent numeric forms like 1, 01, and 0x1.",
    ],
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
  {
    title: "Custom language parts",
    items: [
      "Keywords, boolean literal words, operator aliases, statement terminators, and block delimiter words can be customized.",
      "Custom words cannot conflict with reserved words, fixed symbols or operators, boolean aliases, operator aliases, or each other.",
      "The rules describe the compiler's current behavior, not a theoretical language spec.",
    ],
  },
];

export function CompilerRulesDialog({
  open,
  onOpenChange,
}: CompilerRulesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader className="items-start">
          <div className="flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-primary" aria-hidden="true" />
            <DialogTitle>Compiler language rules</DialogTitle>
          </div>
          <DialogDescription>
            The practical rules that matter when writing code or customizing a
            language for this compiler.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
          <div className="grid gap-3 md:grid-cols-2">
            {ruleSections.map((section) => (
              <section
                key={section.title}
                className="rounded-lg border border-black/10 bg-background p-4 dark:border-white/10"
              >
                <h3 className="text-sm font-semibold">{section.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {section.code ? (
                  <pre className="mt-4 max-h-56 overflow-auto rounded-lg border border-black/10 bg-black/5 p-3 text-xs leading-relaxed text-foreground dark:border-white/10 dark:bg-black/30">
                    <code>{section.code}</code>
                  </pre>
                ) : null}
              </section>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
