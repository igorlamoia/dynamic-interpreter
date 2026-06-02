import {
  IDEOperatorWordMap,
  IDEBooleanLiteralMap,
  IDEKeywordCustomizationModes,
  IDECompilerConfigPayload,
  IDELanguageDocumentationMap,
} from "@/entities/compiler-config";

export type KeywordMapping = {
  original: string;
  custom: string;
  tokenId: number;
};

export type BlockDelimiters = {
  open: string;
  close: string;
};

export type StoredKeywordCustomization = {
  mappings: KeywordMapping[];
  operatorWordMap: IDEOperatorWordMap;
  booleanLiteralMap: IDEBooleanLiteralMap;
  statementTerminatorLexeme: string;
  blockDelimiters: BlockDelimiters;
  modes: IDEKeywordCustomizationModes;
  languageDocumentation: IDELanguageDocumentationMap;
};

export type KeywordContextType = {
  customization: StoredKeywordCustomization;
  /** ID da linguagem ativa do usuário no backend (null = sem ativa / não logado). */
  activeLanguageId: number | null;
  /** Aplica uma customização externa (ex.: linguagem travada de exercício). */
  applyExternalCustomization: (customization: StoredKeywordCustomization) => void;
  /** Restaura a customização da linguagem ativa (após sair de exercício travado). */
  restoreActiveCustomization: () => void;
  setCustomization: (
    value:
      | StoredKeywordCustomization
      | ((current: StoredKeywordCustomization) => StoredKeywordCustomization),
  ) => void;
  setModes: (
    value:
      | IDEKeywordCustomizationModes
      | ((
          current: IDEKeywordCustomizationModes,
        ) => IDEKeywordCustomizationModes),
  ) => void;
  setMappings: (
    value: KeywordMapping[] | ((current: KeywordMapping[]) => KeywordMapping[]),
  ) => void;
  updateKeyword: (original: string, custom: string) => void;
  resetCustomization: () => void;
  /** Retorna o keywordMap final (custom word → token ID) para enviar ao Lexer */
  buildKeywordMap: () => Record<string, number>;
  /** Valida aliases textuais de operadores */
  /** Valida delimitadores customizados de bloco */
  validateBlockDelimiters: (value: BlockDelimiters) => string | null;
  /** Retorna payload completo de customização para APIs do lexer */
  buildLexerConfig: () => IDECompilerConfigPayload;
  /** Valida se uma palavra customizada é válida */
  validateKeyword: (
    original: string,
    custom: string,
    mappingsToValidate?: KeywordMapping[],
  ) => string | null;
};
