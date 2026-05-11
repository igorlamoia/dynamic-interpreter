"use client";

import React from "react";
import type {
  GrammarGraphModeGuard,
  GrammarGraphProduction,
  GrammarGraphProductionSymbol,
} from "@ts-compilator-for-java/compiler/grammar/ast/grammarGraph";

import { cn } from "@/lib/utils";
import type { GrammarGraphViewNode } from "./grammarGraphAdapter";
import { GRAMMAR_GRAPH_KIND_STYLES } from "./grammarGraphStyles";

export type GrammarGraphDetailsPanelProps = {
  node: GrammarGraphViewNode | null;
};

export function GrammarGraphDetailsPanel({
  node,
}: GrammarGraphDetailsPanelProps) {
  if (!node) {
    return (
      <aside className="rounded-lg border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-500">
        Select a grammar node to inspect its productions.
      </aside>
    );
  }

  const productions = node.productions ?? [];

  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-950/90 text-slate-200 shadow-sm shadow-black/20">
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-mono text-base font-semibold text-slate-100">
              {node.label}
            </h2>
            <p className="mt-1 truncate font-mono text-xs text-slate-500">
              {node.id}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded px-2 py-1 text-[10px] font-semibold uppercase ring-1",
              GRAMMAR_GRAPH_KIND_STYLES[node.kind].badge,
            )}
          >
            {node.kind}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-slate-800 p-4 text-sm">
        <DetailTerm>ID</DetailTerm>
        <DetailValue>{node.id}</DetailValue>
        <DetailTerm>Label</DetailTerm>
        <DetailValue>{node.label}</DetailValue>
        <DetailTerm>Kind</DetailTerm>
        <DetailValue>{node.kind}</DetailValue>
        <DetailTerm>Group</DetailTerm>
        <DetailValue>{node.group}</DetailValue>
        <DetailTerm>Description</DetailTerm>
        <DetailValue>{node.description ?? "n/a"}</DetailValue>
        <DetailTerm>Source</DetailTerm>
        <DetailValue>{node.source ?? "n/a"}</DetailValue>
      </dl>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-semibold uppercase text-slate-500">
            Productions
          </h3>
          <span className="text-xs text-slate-600">
            {productions.length === 1
              ? "1 production"
              : `${productions.length} productions`}
          </span>
        </div>
        {productions.length > 0 ? (
          <ol className="grid gap-2">
            {productions.map((production) => (
              <ProductionItem key={production.id} production={production} />
            ))}
          </ol>
        ) : (
          <p className="rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-500">
            No productions recorded for this node.
          </p>
        )}
      </div>
    </aside>
  );
}

function DetailTerm({ children }: { children: React.ReactNode }) {
  return (
    <dt className="text-[11px] font-semibold uppercase text-slate-500">
      {children}
    </dt>
  );
}

function DetailValue({ children }: { children: React.ReactNode }) {
  return (
    <dd className="min-w-0 break-words font-mono text-slate-300">
      {children}
    </dd>
  );
}

function ProductionItem({
  production,
}: {
  production: GrammarGraphProduction;
}) {
  return (
    <li className="rounded-md border border-slate-800 bg-slate-900/45 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold text-slate-100">
          {production.id}
        </span>
        {production.label ? (
          <span className="text-xs text-slate-500">{production.label}</span>
        ) : null}
        <ModeGuard modes={production.modes} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {production.symbols.map((symbol, index) => (
          <SymbolChip key={`${symbol.id}-${index}`} symbol={symbol} />
        ))}
      </div>
    </li>
  );
}

function SymbolChip({ symbol }: { symbol: GrammarGraphProductionSymbol }) {
  return (
    <span className="inline-flex min-h-7 items-center gap-1 rounded border border-slate-800 bg-slate-950/70 px-2 font-mono text-xs text-slate-300">
      {symbol.id}
      {symbol.optional ? <span className="text-amber-300">?</span> : null}
      {symbol.repeat ? (
        <span className="text-amber-300">{symbol.repeat}</span>
      ) : null}
      <ModeGuard modes={symbol.modes} />
    </span>
  );
}

function ModeGuard({ modes }: { modes: GrammarGraphModeGuard | undefined }) {
  const label = formatModes(modes);
  if (!label) return null;

  return (
    <span className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-200 ring-1 ring-amber-300/20">
      {label}
    </span>
  );
}

function formatModes(modes: GrammarGraphModeGuard | undefined) {
  const entries = Object.entries(modes ?? {});
  if (entries.length === 0) return undefined;

  return entries.map(([mode, value]) => `${mode}:${value}`).join(", ");
}
