import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { WizardStepId } from "./wizard-model";

function getKeyword(
  draft: StoredKeywordCustomization,
  original: string,
): string {
  return (
    draft.mappings.find((item) => item.original === original)?.custom ??
    original
  );
}

function buildLineEnding(draft: StoredKeywordCustomization): string {
  if (draft.modes.semicolon !== "required") {
    return "";
  }

  return draft.statementTerminatorLexeme.trim() || ";";
}

function buildRequiredLineEnding(draft: StoredKeywordCustomization): string {
  return draft.statementTerminatorLexeme.trim() || ";";
}

function buildOperatorWord(
  draft: StoredKeywordCustomization,
  key: keyof StoredKeywordCustomization["operatorWordMap"],
  fallback: string,
): string {
  return draft.operatorWordMap[key]?.trim() || fallback;
}

export function buildOptionalTerminatorSnippet(
  draft: StoredKeywordCustomization,
): string {
  const print = getKeyword(draft, "print");
  return `${print}("ok")`;
}

export function buildRequiredTerminatorSnippet(
  draft: StoredKeywordCustomization,
): string {
  return `${buildOptionalTerminatorSnippet(draft)}${buildRequiredLineEnding(draft)}`;
}

function buildArrayDeclarationPrefix(
  draft: StoredKeywordCustomization,
): string {
  if (draft.modes.typing === "untyped") {
    return "";
  }

  return `${getKeyword(draft, "string")} `;
}

export function buildFixedArraySnippet(
  draft: StoredKeywordCustomization,
): string {
  const lineEnding = buildLineEnding(draft);
  const prefix = buildArrayDeclarationPrefix(draft);
  return `${prefix}animes[2] = ["Naruto", "AOT"]${lineEnding}`;
}

export function buildDynamicArraySnippet(
  draft: StoredKeywordCustomization,
): string {
  const lineEnding = buildLineEnding(draft);
  const prefix = buildArrayDeclarationPrefix(draft);
  return `${prefix}animes[] = ["Naruto", "AOT"]${lineEnding}`;
}

function buildRichReviewSnippet(draft: StoredKeywordCustomization): string {
  const lineEnding = buildLineEnding(draft);
  const funcao = getKeyword(draft, "funcao");
  const print = getKeyword(draft, "print");
  const scan = getKeyword(draft, "scan");
  const conditional = getKeyword(draft, "if");
  const otherwise = getKeyword(draft, "else");
  const loop = getKeyword(draft, "while");
  const forKeyword = getKeyword(draft, "for");
  const returnKeyword = getKeyword(draft, "return");
  const breakKeyword = getKeyword(draft, "break");
  const continueKeyword = getKeyword(draft, "continue");
  const switchKeyword = getKeyword(draft, "switch");
  const caseKeyword = getKeyword(draft, "case");
  const defaultKeyword = getKeyword(draft, "default");
  const intType = getKeyword(draft, "int");
  const floatType = getKeyword(draft, "float");
  const boolType = getKeyword(draft, "bool");
  const stringType = getKeyword(draft, "string");
  const variableKeyword = getKeyword(draft, "variavel");
  const boolTrue = draft.booleanLiteralMap.true?.trim() || "true";
  const boolFalse = draft.booleanLiteralMap.false?.trim() || "false";
  const logicalOr = buildOperatorWord(draft, "logical_or", "ou");
  const logicalAnd = buildOperatorWord(draft, "logical_and", "e");
  const logicalNot = buildOperatorWord(draft, "logical_not", "nao");
  const greater = buildOperatorWord(draft, "greater", ">");
  const greaterEqual = buildOperatorWord(draft, "greater_equal", ">=");
  const less = buildOperatorWord(draft, "less", "<");
  const equalEqual = buildOperatorWord(draft, "equal_equal", "==");
  const notEqual = buildOperatorWord(draft, "not_equal", "!=");
  const arrayPrefix = draft.modes.typing === "untyped" ? "" : `${stringType} `;
  const arrayLine =
    draft.modes.array === "fixed"
      ? `${arrayPrefix}animes[2] = ["Naruto", "AOT"]${lineEnding}`
      : `${arrayPrefix}animes[] = ["Naruto", "AOT"]${lineEnding}`;
  const typedDeclarations = [
    `${stringType} nome = "Kiki"${lineEnding}`,
    `${intType} idade = 25${lineEnding}`,
    `${floatType} altura = 1.75${lineEnding}`,
    `${boolType} estudante = ${boolTrue}${lineEnding}`,
    `${boolType} estagiario = ${boolFalse}${lineEnding}`,
  ];
  const genericDeclarations = [
    `${variableKeyword} nome = "Kiki"${lineEnding}`,
    `${variableKeyword} idade = 25${lineEnding}`,
    `${variableKeyword} altura = 1.75${lineEnding}`,
    `${variableKeyword} estudante = ${boolTrue}${lineEnding}`,
    `${variableKeyword} estagiario = ${boolFalse}${lineEnding}`,
  ];
  const declarations =
    draft.modes.typing === "untyped" ? genericDeclarations : typedDeclarations;

  if (draft.modes.block === "indentation") {
    return `${funcao} main():
  ${declarations.join("\n\t")}
  ${arrayLine}
  ${print}("Olá Mundo!")${lineEnding}
  ${scan}(nome)${lineEnding}
  ${conditional} (${boolTrue} ${logicalAnd} idade ${greater} 18):
    ${print}("maior de idade")${lineEnding}
  ${otherwise}:
    ${print}("menor de idade")${lineEnding}
  ${loop} (idade ${less} 30):
    idade = idade + 1${lineEnding}
    ${conditional} (idade ${equalEqual} 28):
      ${continueKeyword}${lineEnding}
    ${conditional} (idade ${equalEqual} 29):
      ${breakKeyword}${lineEnding}
  ${forKeyword} (i = 0; i ${less} 3; i = i + 1):
    ${print}(i)${lineEnding}
  ${switchKeyword} (nivel):
    ${caseKeyword} 1:
      ${print}("iniciante")${lineEnding}
    ${caseKeyword} 2:
      ${print}("intermediario")${lineEnding}
    ${defaultKeyword}:
      ${print}("avancado")${lineEnding}
  ${conditional} (${logicalNot} estudante ${logicalOr} idade ${greaterEqual} 18):
    ${print}("avaliacao")${lineEnding}
  ${conditional} (altura ${notEqual} 0):
    ${print}("alturas ok")${lineEnding}
  ${returnKeyword} idade${lineEnding}`;
  }

  const open = draft.blockDelimiters.open.trim() || "{";
  const close = draft.blockDelimiters.close.trim() || "}";

  return `${funcao} main()${open}
  ${declarations.join("\n  ")}
  ${arrayLine}
  ${print}("Olá Mundo!")${lineEnding}
  ${scan}(nome)${lineEnding}
  ${conditional} (${boolTrue} ${logicalAnd} idade ${greater} 18) ${open}
    ${print}("maior de idade")${lineEnding}
  ${close} ${otherwise} ${open}
    ${print}("menor de idade")${lineEnding}
  ${close}
  ${loop} (idade ${less} 30) ${open}
    idade = idade + 1${lineEnding}
    ${conditional} (idade ${equalEqual} 28) ${open}
      ${continueKeyword}${lineEnding}
    ${close}
    ${conditional} (idade ${equalEqual} 29) ${open}
      ${breakKeyword}${lineEnding}
    ${close}
  ${close}
  ${forKeyword} (i = 0; i ${less} 3; i = i + 1) ${open}
    ${print}(i)${lineEnding}
  ${close}
  ${switchKeyword} (nivel) ${open}
    ${caseKeyword} 1:${lineEnding}
      ${print}("iniciante")${lineEnding}
    ${caseKeyword} 2:${lineEnding}
      ${print}("intermediario")${lineEnding}
    ${defaultKeyword}:${lineEnding}
      ${print}("avancado")${lineEnding}
  ${close}
  ${conditional} (${logicalNot} estudante ${logicalOr} idade ${greaterEqual} 18) ${open}
    ${print}("avaliacao")${lineEnding}
  ${close}
  ${conditional} (altura ${notEqual} 0) ${open}
    ${print}("alturas ok")${lineEnding}
  ${close}
  ${returnKeyword} idade${lineEnding}
${close}`;
}

export function untypedVariableSnippet(
  draft: StoredKeywordCustomization,
): string {
  const lineEnding = buildLineEnding(draft);
  const variable = getKeyword(draft, "variavel");
  return `${variable} nome = "Kiki"${lineEnding}\n${variable} idade = 25${lineEnding}\n${variable} altura = 1.75${lineEnding}\n${variable} estudante = true${lineEnding}`;
}
export function typedVariableSnippet(
  draft: StoredKeywordCustomization,
): string {
  const lineEnding = buildLineEnding(draft);
  const stringType = getKeyword(draft, "string");
  const intType = getKeyword(draft, "int");
  const floatType = getKeyword(draft, "float");
  const boolType = getKeyword(draft, "bool");
  return `${stringType} nome = "Kiki"${lineEnding}\n${intType} idade = 25${lineEnding}\n${floatType} altura = 1.75${lineEnding}\n${boolType} estudante = true${lineEnding}`;
}
export function buildVariableSnippet(
  draft: StoredKeywordCustomization,
): string {
  if (draft.modes.typing === "untyped") return untypedVariableSnippet(draft);
  return typedVariableSnippet(draft);
}

export function buildIdentationSnippet(
  draft: StoredKeywordCustomization,
): string {
  const conditional = getKeyword(draft, "if");
  const otherwise = getKeyword(draft, "else");
  const print = getKeyword(draft, "print");
  const boolTrue = draft.booleanLiteralMap.true?.trim() || "true";
  const lineEnding = buildLineEnding(draft);
  const funcao = getKeyword(draft, "funcao");

  const baseCodeSnippet = `${funcao} main()`;

  return `${baseCodeSnippet}:\n\t${conditional} (${boolTrue}):\n\t\t${print}("Olá Mundo!")\n\t${otherwise}:\n\t\t${print}("Sou mudo")`;
}

export function buildDelimiterSnippet(
  draft: StoredKeywordCustomization,
): string {
  const print = getKeyword(draft, "print");
  const scan = getKeyword(draft, "scan");
  const lineEnding = buildLineEnding(draft);
  const funcao = getKeyword(draft, "funcao");
  const baseCodeSnippet = `${funcao} main()`;

  const open = draft.blockDelimiters.open.trim() || "{";
  const close = draft.blockDelimiters.close.trim() || "}";

  return `${baseCodeSnippet}${open}\n\t${print}("Olá Mundo!")${lineEnding}
  ${scan}(nome)${lineEnding}\n\t${print}("Me chamo:", nome)\n${close}`;
}

export function buildBlockSnippet(draft: StoredKeywordCustomization): string {
  if (draft.modes.block === "indentation") return buildIdentationSnippet(draft);
  return buildDelimiterSnippet(draft);
}

function buildFlowSnippet(draft: StoredKeywordCustomization): string {
  const loop = getKeyword(draft, "while");
  const print = getKeyword(draft, "print");
  const returnKeyword = getKeyword(draft, "return");
  const boolTrue = draft.booleanLiteralMap.true?.trim() || "true";
  const lineEnding = buildLineEnding(draft);

  if (draft.modes.block === "indentation") {
    return `${loop} (${boolTrue}):\n\t${print}("processando")\n\t${returnKeyword} valor`;
  }

  const open = draft.blockDelimiters.open.trim() || "{";
  const close = draft.blockDelimiters.close.trim() || "}";

  return `${loop} (${boolTrue}) ${open}\n  ${print}("processando")${lineEnding}\n  ${returnKeyword} valor${lineEnding}\n${close}`;
}

export function buildPreviewSource(
  draft: StoredKeywordCustomization,
  activeStepId: WizardStepId,
): string {
  if (activeStepId === "review") {
    return buildRichReviewSnippet(draft);
  }

  if (activeStepId === "types") {
    return buildVariableSnippet(draft);
  }

  if (activeStepId === "flow") {
    return buildFlowSnippet(draft);
  }

  return buildBlockSnippet(draft);
}
