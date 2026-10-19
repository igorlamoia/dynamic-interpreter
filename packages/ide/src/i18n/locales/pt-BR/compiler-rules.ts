import type { CompilerRulesIntl } from "../../types/compiler-rules";

const compilerRules: CompilerRulesIntl = {
  title: "Regras da linguagem do compilador",
  description:
    "As regras praticas que importam ao escrever codigo para este compilador.",
  close: "Fechar",
  sections: [
    {
      title: "Formato do programa",
      items: [
        "Um programa e formado por declaracoes de funcoes.",
        "A execucao comeca em main.",
        "No modo tipado, funcoes comecam com um tipo de retorno; no modo nao tipado, comecam com function.",
        "O corpo de uma funcao pode ser uma unica instrucao ou um bloco.",
      ],
      code: `int main() {
  return 0;
}

function main() {
  return 0;
}`,
    },
    {
      title: "Blocos e finais de instrucao",
      items: [
        "if, else, while e for podem usar um corpo de uma unica instrucao sem chaves.",
        "Use delimitadores quando o corpo tiver varias instrucoes.",
        "Ponto e virgula sempre e um terminador de instrucao valido.",
        "O modo EOL opcional permite que limites validos de linha ou bloco terminem instrucoes.",
        "Instrucoes consecutivas na mesma linha ainda precisam de um terminador.",
      ],
      code: `if (ready) print("ok");

if (ready) {
  print("start");
  print("done");
}

int b = 1; print(b);`,
    },
    {
      title: "Entrada, saida e atualizacoes",
      items: [
        "print aceita zero ou mais expressoes.",
        "O scan tipado exige um tipo ou dica de formato; o scan nao tipado usa apenas a variavel de destino.",
        "Destinos de scan devem ser variaveis atribuiveis ou elementos validos de array.",
        "Atribuicoes, atribuicoes compostas, atualizacoes de prefixo e atualizacoes de sufixo sao aceitas.",
        "Incremento e decremento funcionam para variaveis escalares, nao para elementos de array.",
      ],
      code: `scan(int, x);
scan("%f", price);
scan(name);

x += value;
++x;
x--;`,
    },
    {
      title: "Modo tipado",
      items: [
        "O modo tipado e o padrao.",
        "Os tipos de variaveis sao int, float, bool e string.",
        "Tipos de retorno de funcao adicionam void, que so e valido para retornos.",
        "Declaracoes escalares multiplas e inicializacao por variavel sao aceitas.",
        "Um inicializador final se aplica aos nomes escalares anteriores ainda nao inicializados na mesma declaracao.",
      ],
      code: `int a = 1, b = 2, c = 3;
bool hasX, hasY = false;
int a, b, c = 7;`,
    },
    {
      title: "Arrays",
      items: [
        "Arrays fixos usam tamanhos inteiros positivos; arrays dinamicos usam colchetes vazios.",
        "O acesso a arrays fixos deve corresponder ao numero de dimensoes declaradas.",
        "Arrays dinamicos podem crescer na escrita.",
        "Ler uma posicao de array dinamico que nunca foi escrita gera um erro em tempo de execucao.",
        "Arrays passados para funcoes sao passados por referencia.",
      ],
      code: `int values[2];
int matrix[2][3];
int dynamicValues[];

void edit(int matrix[2][2]) {
  matrix[0][0] = 99;
}`,
    },
    {
      title: "Literais de array",
      items: [
        "Literais de array sao aceitos apenas durante declaracao ou inicializacao.",
        "Eles nao sao aceitos em atribuicoes normais.",
        "Literais fixos devem corresponder ao tamanho declarado e a profundidade de aninhamento.",
        "Valores de literais tipados devem ser compativeis com o tipo base do array.",
      ],
      code: `int values[2] = [0, 1];
int matrix[2][2] = [[0, 1], [2, 3]];

values = [0, 1]; // invalido`,
    },
    {
      title: "Modo nao tipado",
      items: [
        "O modo nao tipado usa function, variable e parametros sem tipos.",
        "Declaracoes escalares multiplas e inicializadores finais funcionam como no modo tipado.",
        "Arrays podem ser declarados com variable.",
        "Declaracoes abreviadas de array exigem um inicializador literal de array.",
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
