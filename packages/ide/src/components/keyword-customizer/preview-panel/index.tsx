import { useEffect, useRef, useState } from "react";
import type { WizardPreview } from "../preview-data";
import type { WizardStepId } from "../wizard-model";
import { ExampleSnippet } from "../example-snippet";

import { CardSnapStack } from "./card-snap-stack";
import { CategorySection } from "./category-section";
import { PREVIEW_CATEGORIES, PreviewCategory } from "./categories-list";
import { Overlay } from "@/components/effect/overlay";

export type PreviewPanelProps = {
  preview: WizardPreview;
  activeStepId?: WizardStepId;
};

export type CategoryTone = {
  chip: string;
  progress: string;
  progressTrack: string;
  borderChanged: string;
  textChanged: string;
  line: string;
};

export type CategoryLexemeItem = {
  original: string;
  custom: string;
  isChanged: boolean;
};

type GroupedCategory = PreviewCategory & {
  items: CategoryLexemeItem[];
  changedCount: number;
  percentage: number;
};

function buildLexemeChangeMap(preview: WizardPreview): Map<string, string> {
  return new Map(
    preview.chosenLexemes.map((item) => [item.original, item.custom]),
  );
}

function resolveChangedLexemeOriginal(
  previousChanges: Map<string, string>,
  currentChanges: WizardPreview["chosenLexemes"],
): string | undefined {
  const currentChangesMap = new Map(
    currentChanges.map((item) => [item.original, item.custom]),
  );

  const editedChange = currentChanges.find(
    (item) => previousChanges.get(item.original) !== item.custom,
  );

  if (editedChange) return editedChange.original;

  for (const original of previousChanges.keys()) {
    if (!currentChangesMap.has(original)) return original;
  }

  return undefined;
}

function findPreviewCategoryKeyForLexeme(
  original: string,
): PreviewCategory["key"] | undefined {
  return PREVIEW_CATEGORIES.find((category) =>
    category.lexemes.includes(original),
  )?.key;
}

function findPreviewCategoryKeyForStep(
  stepId?: WizardStepId,
): PreviewCategory["key"] | undefined {
  switch (stepId) {
    case "IO":
      return "entrada";
    case "types":
      return "tipos";
    case "structure":
      return "estrutura";
    case "rules":
      return "operadores";
    case "flow":
      return "fluxo";
    default:
      return undefined;
  }
}

function buildCategoryItems(
  category: PreviewCategory,
  changedMap: Map<string, string>,
): CategoryLexemeItem[] {
  return category.lexemes.map((original) => {
    const changed = changedMap.get(original);

    return {
      original,
      custom: changed ?? original,
      isChanged: Boolean(changed && changed !== original),
    };
  });
}

function segregateLexemeChangesByCategory(
  preview: WizardPreview,
): GroupedCategory[] {
  const changedMap = buildLexemeChangeMap(preview);

  return PREVIEW_CATEGORIES.map((category) => {
    const items = buildCategoryItems(category, changedMap);
    const changedCount = items.filter((item) => item.isChanged).length;
    const percentage =
      items.length > 0 ? Math.round((changedCount / items.length) * 100) : 0;

    return {
      ...category,
      items,
      changedCount,
      percentage,
    };
  });
}

function formatPreviewCategoryLabel(title: string): string {
  return title
    .toLowerCase()
    .replace(/(^|[\s/])([a-z])/g, (_, separator: string, char: string) => {
      return `${separator}${char.toUpperCase()}`;
    })
    .replace(/\sE\s/g, " e ");
}

export function PreviewPanel({ preview, activeStepId }: PreviewPanelProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const previousLexemeChangesRef = useRef<Map<string, string> | null>(null);
  const [focusRequest, setFocusRequest] = useState<{
    key: PreviewCategory["key"];
    id: number;
  }>();
  const groupedLexemes = segregateLexemeChangesByCategory(preview);
  const cardItems = groupedLexemes.map((category) => {
    const { key, title, icon, subtitle, items, changedCount, percentage } =
      category;

    return {
      key,
      label: formatPreviewCategoryLabel(title),
      icon,
      children: (
        <CategorySection
          title={title}
          subtitle={subtitle}
          icon={icon}
          items={items}
          changedCount={changedCount}
          percentage={percentage}
        />
      ),
    };
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const previousChanges = previousLexemeChangesRef.current;
    const currentChanges = buildLexemeChangeMap(preview);

    if (previousChanges) {
      const changedOriginal = resolveChangedLexemeOriginal(
        previousChanges,
        preview.chosenLexemes,
      );
      const changedCategoryKey = changedOriginal
        ? findPreviewCategoryKeyForLexeme(changedOriginal)
        : undefined;

      if (changedCategoryKey) {
        setFocusRequest((current) => ({
          key: changedCategoryKey,
          id: (current?.id ?? 0) + 1,
        }));
      }
    }

    previousLexemeChangesRef.current = currentChanges;
  }, [preview]);

  useEffect(() => {
    const changedCategoryKey = findPreviewCategoryKeyForStep(activeStepId);

    if (changedCategoryKey) {
      setFocusRequest((current) => ({
        key: changedCategoryKey,
        id: (current?.id ?? 0) + 1,
      }));
    }
  }, [activeStepId]);

  return (
    <aside
      data-preview-panel
      className={`max-lg:h-[calc(100dvh-1rem)] lg:fixed lg:right-0 self-start pl-2 overflow-hidden lg:w-90 transition-[top,height] duration-300 ease-out ${
        isScrolled
          ? "lg:top-0 lg:h-screen"
          : "lg:top-18 lg:h-[calc(100vh-4rem)]"
      }`}
    >
      <div className="relative flex h-full flex-col gap-6 overflow-hidden rounded-lg py-4 pr-4">
        <ExampleSnippet title="Preview do código" code={preview.snippet} />

        <CardSnapStack
          items={cardItems}
          focusKey={focusRequest?.key}
          focusRequestId={focusRequest?.id}
        />
        <Overlay side="bottom" />
      </div>
    </aside>
  );
}
