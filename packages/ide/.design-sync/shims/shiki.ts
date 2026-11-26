// design-sync only (aliased via .design-sync/tsconfig.json paths): a
// fine-grained shiki so _ds_bundle.js doesn't inline all ~300 grammars and
// ~60 themes (~9.8 MB). Same `codeToHtml` API CodeComparison calls; grammars
// limited to the ones the IDE uses (Java first), themes to the two the app
// passes. Unknown languages throw -> CodeComparison's own <pre> fallback.
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import java from "@shikijs/langs/java";
import javascript from "@shikijs/langs/javascript";
import typescript from "@shikijs/langs/typescript";
import python from "@shikijs/langs/python";
import c from "@shikijs/langs/c";
import json from "@shikijs/langs/json";
import githubLight from "@shikijs/themes/github-light";
import githubDark from "@shikijs/themes/github-dark";

let highlighter: Promise<HighlighterCore> | null = null;

export async function codeToHtml(
  code: string,
  options: Parameters<HighlighterCore["codeToHtml"]>[1],
): Promise<string> {
  highlighter ??= createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: [java, javascript, typescript, python, c, json],
    engine: createJavaScriptRegexEngine(),
  });
  return (await highlighter).codeToHtml(code, options);
}
