import type { CompilerRulesIntl } from "../../types/compiler-rules";

const compilerRules: CompilerRulesIntl = {
  title: "Reglas del lenguaje del compilador",
  description:
    "Las reglas practicas que importan al escribir codigo para este compilador.",
  close: "Cerrar",
  sections: [
    {
      title: "Forma del programa",
      items: [
        "Un programa esta formado por declaraciones de funciones.",
        "La ejecucion empieza en main.",
        "En modo tipado, las funciones empiezan con un tipo de retorno; en modo no tipado, empiezan con function.",
        "El cuerpo de una funcion puede ser una sola sentencia o un bloque.",
      ],
      code: `int main() {
  return 0;
}

function main() {
  return 0;
}`,
    },
    {
      title: "Bloques y finales de sentencia",
      items: [
        "if, else, while y for pueden usar un cuerpo de una sola sentencia sin llaves.",
        "Usa delimitadores cuando el cuerpo tenga varias sentencias.",
        "Los puntos y coma siempre son terminadores de sentencia validos.",
        "El modo EOL opcional permite que limites validos de linea o bloque terminen sentencias.",
        "Las sentencias consecutivas en la misma linea siguen necesitando un terminador.",
      ],
      code: `if (ready) print("ok");

if (ready) {
  print("start");
  print("done");
}

int b = 1; print(b);`,
    },
    {
      title: "Entrada, salida y actualizaciones",
      items: [
        "print acepta cero o mas expresiones.",
        "El scan tipado requiere un tipo o una pista de formato; el scan no tipado usa solo la variable de destino.",
        "Los destinos de scan deben ser variables asignables o elementos validos de arreglo.",
        "Se aceptan asignaciones, asignaciones compuestas, actualizaciones de prefijo y actualizaciones de sufijo.",
        "Incremento y decremento funcionan con variables escalares, no con elementos de arreglo.",
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
        "El modo tipado es el predeterminado.",
        "Los tipos de variables son int, float, bool y string.",
        "Los tipos de retorno de funcion agregan void, que solo es valido para retornos.",
        "Se aceptan declaraciones escalares multiples e inicializacion por variable.",
        "Un inicializador final se aplica a los nombres escalares anteriores no inicializados en la misma declaracion.",
      ],
      code: `int a = 1, b = 2, c = 3;
bool hasX, hasY = false;
int a, b, c = 7;`,
    },
    {
      title: "Arreglos",
      items: [
        "Los arreglos fijos usan tamanos enteros positivos; los arreglos dinamicos usan corchetes vacios.",
        "El acceso a arreglos fijos debe coincidir con la cantidad de dimensiones declaradas.",
        "Los arreglos dinamicos pueden crecer al escribir.",
        "Leer una posicion de arreglo dinamico que nunca fue escrita genera un error en tiempo de ejecucion.",
        "Los arreglos pasados a funciones se pasan por referencia.",
      ],
      code: `int values[2];
int matrix[2][3];
int dynamicValues[];

void edit(int matrix[2][2]) {
  matrix[0][0] = 99;
}`,
    },
    {
      title: "Literales de arreglo",
      items: [
        "Los literales de arreglo se aceptan solo durante declaracion o inicializacion.",
        "No se aceptan en asignaciones normales.",
        "Los literales fijos deben coincidir con el tamano declarado y la profundidad de anidamiento.",
        "Los valores de literales tipados deben ser compatibles con el tipo base del arreglo.",
      ],
      code: `int values[2] = [0, 1];
int matrix[2][2] = [[0, 1], [2, 3]];

values = [0, 1]; // invalido`,
    },
    {
      title: "Modo no tipado",
      items: [
        "El modo no tipado usa function, variable y parametros sin tipos.",
        "Las declaraciones escalares multiples y los inicializadores finales funcionan como en el modo tipado.",
        "Los arreglos pueden declararse con variable.",
        "Las declaraciones abreviadas de arreglos requieren un inicializador literal de arreglo.",
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
