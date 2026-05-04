"use client";

import React, { useEffect, useMemo, useState } from "react";

import { GrammarGraphCanvas } from "@/features/grammarGraph/GrammarGraphCanvas";
import { GrammarGraphDetailsPanel } from "@/features/grammarGraph/GrammarGraphDetailsPanel";
import { GrammarGraphToolbar } from "@/features/grammarGraph/GrammarGraphToolbar";
import {
  buildGrammarGraphModel,
  filterGrammarGraphModel,
  type GrammarGraphModelFilters,
  type SelectedGrammarModes,
} from "@/features/grammarGraph/grammarGraphAdapter";
import { cn } from "@/lib/utils";

export type AstProps = {
  selectedModes?: SelectedGrammarModes;
  height?: number | string;
  showToolbar?: boolean;
  className?: string;
};

type InternalGrammarGraphFilters = Omit<
  GrammarGraphModelFilters,
  "selectedModes"
>;

export function Ast({
  selectedModes = {},
  height = 720,
  showToolbar = true,
  className,
}: AstProps) {
  const [filters, setFilters] = useState<InternalGrammarGraphFilters>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const model = useMemo(() => buildGrammarGraphModel(), []);
  const effectiveFilters = useMemo<GrammarGraphModelFilters>(
    () => ({ ...filters, selectedModes }),
    [filters, selectedModes],
  );
  const filteredModel = useMemo(
    () => filterGrammarGraphModel(model, effectiveFilters),
    [effectiveFilters, model],
  );

  useEffect(() => {
    if (selectedNodeId && !filteredModel.nodeById.has(selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [filteredModel.nodeById, selectedNodeId]);

  const selectedNode = selectedNodeId
    ? filteredModel.nodeById.get(selectedNodeId) ?? null
    : null;

  const updateFilters = (nextFilters: GrammarGraphModelFilters) => {
    const { selectedModes: _selectedModes, ...nextInternalFilters } =
      nextFilters;
    setFilters(nextInternalFilters);
  };

  return (
    <section
      className={cn(
        "grid gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-100",
        showToolbar
          ? "grid-rows-[auto_auto_minmax(0,1fr)]"
          : "grid-rows-[auto_minmax(0,1fr)]",
        className,
      )}
      style={{ height: formatHeight(height) }}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-slate-100">
            Grammar graph
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {filteredModel.nodes.length} nodes / {filteredModel.edges.length}{" "}
            edges
          </p>
        </div>
        <SelectedModesSummary selectedModes={selectedModes} />
      </header>

      {showToolbar ? (
        <GrammarGraphToolbar
          model={model}
          filters={effectiveFilters}
          onChange={updateFilters}
        />
      ) : null}

      <div className="grid min-h-0 gap-3 overflow-auto lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="min-h-0">
          <GrammarGraphCanvas
            model={filteredModel}
            onSelectNode={(node) => setSelectedNodeId(node.id)}
          />
        </div>
        <div className="min-h-0 overflow-auto">
          <GrammarGraphDetailsPanel node={selectedNode} />
        </div>
      </div>
    </section>
  );
}

function SelectedModesSummary({
  selectedModes,
}: {
  selectedModes: SelectedGrammarModes;
}) {
  const entries = Object.entries(selectedModes).filter(
    ([, value]) => value !== undefined,
  );

  if (entries.length === 0) {
    return (
      <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-1 text-xs text-slate-500">
        all modes
      </span>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {entries.map(([mode, value]) => (
        <span
          key={mode}
          className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/70 px-2 py-1 font-mono text-xs text-slate-300"
        >
          <span className="text-slate-500">{mode}</span>
          <span className="text-slate-600">=</span>
          <span className="font-semibold text-cyan-100">{value}</span>
        </span>
      ))}
    </div>
  );
}

function formatHeight(height: number | string) {
  return typeof height === "number" ? `${height}px` : height;
}
