export interface CompilerRuleSectionIntl {
  title: string;
  items: string[];
  code?: string;
}

export interface CompilerRulesIntl {
  title: string;
  description: string;
  close: string;
  sections: CompilerRuleSectionIntl[];
}
