"use client";

import React, { useMemo } from "react";
import type {
  GrammarGraphNodeKind,
  GrammarModeName,
} from "@ts-compilator-for-java/compiler/grammar/ast/grammarGraph";

import { cn } from "@/lib/utils";
import type {
  GrammarGraphModel,
  GrammarGraphModelFilters,
} from "./grammarGraphAdapter";
import { GRAMMAR_GRAPH_KIND_STYLES } from "./grammarGraphStyles";

const NODE_KINDS: GrammarGraphNodeKind[] = [
  "nonterminal",
  "terminal",
  "option",
  "mode",
];

export type GrammarGraphToolbarProps = {
  model: GrammarGraphModel;
  filters: GrammarGraphModelFilters;
  onChange: (filters: GrammarGraphModelFilters) => void;
};

export function GrammarGraphToolbar({
  model,
  filters,
  onChange,
}: GrammarGraphToolbarProps) {
  const selectedKinds = filters.kinds;
  const modeValues = useMemo(() => collectModeValues(model), [model]);

  const updateFilters = (next: GrammarGraphModelFilters) => {
    onChange(next);
  };

  const updateKind = (kind: GrammarGraphNodeKind, checked: boolean) => {
    const kinds = new Set(selectedKinds ?? NODE_KINDS);

    if (checked) {
      kinds.add(kind);
    } else {
      kinds.delete(kind);
    }

    updateFilters({
      ...filters,
      kinds: kinds.size === NODE_KINDS.length ? undefined : kinds,
    });
  };

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/90 p-3 text-slate-200 shadow-sm shadow-black/20">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,260px)_auto] lg:items-end">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase text-slate-500">
            Search
          </span>
          <input
            type="search"
            value={filters.search ?? ""}
            onChange={(event) =>
              updateFilters({
                ...filters,
                search: event.currentTarget.value || undefined,
              })
            }
            placeholder="id or label"
            className="h-9 rounded-md border border-slate-800 bg-slate-900/75 px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase text-slate-500">
            Section
          </span>
          <select
            value={filters.sectionId ?? ""}
            onChange={(event) =>
              updateFilters({
                ...filters,
                sectionId: event.currentTarget.value || undefined,
              })
            }
            className="h-9 rounded-md border border-slate-800 bg-slate-900/75 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30"
          >
            <option value="">All sections</option>
            {model.sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="min-w-0">
          <legend className="mb-1.5 text-[11px] font-semibold uppercase text-slate-500">
            Kinds
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {NODE_KINDS.map((kind) => (
              <label
                key={kind}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/70 px-2 text-[11px] font-semibold uppercase text-slate-300 transition hover:border-slate-700",
                  GRAMMAR_GRAPH_KIND_STYLES[kind].border,
                )}
              >
                <input
                  type="checkbox"
                  value={kind}
                  checked={!selectedKinds || selectedKinds.has(kind)}
                  onChange={(event) =>
                    updateKind(kind, event.currentTarget.checked)
                  }
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 accent-cyan-400"
                />
                {kind}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
        <span className="text-[11px] font-semibold uppercase text-slate-500">
          Modes
        </span>
        {modeValues.length > 0 ? (
          modeValues.map(([mode, values]) => (
            <span
              key={mode}
              className="inline-flex min-h-7 items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/60 px-2 text-xs text-slate-300"
            >
              <span className="font-mono text-slate-400">{mode}</span>
              <span className="text-slate-600">=</span>
              <span className="font-semibold text-slate-100">
                {filters.selectedModes?.[mode] ?? "any"}
              </span>
              <span className="text-slate-600">/</span>
              <span className="font-mono text-[11px] text-slate-500">
                {values.join(", ")}
              </span>
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-500">No mode guards</span>
        )}
      </div>
    </section>
  );
}

function collectModeValues(
  model: GrammarGraphModel,
): [GrammarModeName, string[]][] {
  const valuesByMode = new Map<GrammarModeName, Set<string>>();

  for (const edge of model.edges) {
    addModeValues(valuesByMode, edge.data.modes);
  }

  for (const node of model.nodes) {
    for (const production of node.productions ?? []) {
      addModeValues(valuesByMode, production.modes);
      for (const symbol of production.symbols) {
        addModeValues(valuesByMode, symbol.modes);
      }
    }
  }

  return Array.from(valuesByMode.entries())
    .map<[GrammarModeName, string[]]>(([mode, values]) => [
      mode,
      Array.from(values).sort(),
    ])
    .sort(([left], [right]) => left.localeCompare(right));
}

function addModeValues(
  valuesByMode: Map<GrammarModeName, Set<string>>,
  modes: Partial<Record<GrammarModeName, string>> | undefined,
) {
  for (const [mode, value] of Object.entries(modes ?? {}) as [
    GrammarModeName,
    string,
  ][]) {
    const values = valuesByMode.get(mode) ?? new Set<string>();
    values.add(value);
    valuesByMode.set(mode, values);
  }
}
