import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) {
    return null;
  }

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    pages.push(1);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();
  const startItem = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const endItem = pageSize && totalItems ? Math.min(page * pageSize, totalItems) : undefined;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none",
        className,
      )}
      aria-label="Navegação por páginas"
    >
      {totalItems !== undefined && (
        <p className="text-xs text-muted-foreground">
          {startItem !== undefined && endItem !== undefined ? (
            <>
              Mostrando <span className="font-semibold text-foreground">{startItem}</span> a{" "}
              <span className="font-semibold text-foreground">{endItem}</span> de{" "}
              <span className="font-semibold text-foreground">{totalItems}</span> resultados
            </>
          ) : (
            <>
              Total de <span className="font-semibold text-foreground">{totalItems}</span> itens
            </>
          )}
        </p>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center gap-1.5" aria-label="Paginação">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors",
              "border-border bg-card/80 text-foreground hover:bg-accent hover:border-cyan-400/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
              page <= 1 && "opacity-40 cursor-not-allowed pointer-events-none",
            )}
          >
            <ChevronLeft className="size-3.5" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1">
            {pages.map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-1 text-xs text-slate-600 select-none"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = item === page;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-label={`Página ${item}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "min-w-8 h-8 px-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center",
                    isCurrent
                      ? "bg-[#0dccf2]/20 border-[#0dccf2]/60 text-[#0dccf2] shadow-[0_0_12px_rgba(13,204,242,0.25)]"
                      : "border-border bg-card/80 text-foreground hover:bg-accent hover:border-cyan-400/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Próxima página"
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors",
              "border-border bg-card/80 text-foreground hover:bg-accent hover:border-cyan-400/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
              page >= totalPages && "opacity-40 cursor-not-allowed pointer-events-none",
            )}
          >
            <span>Próxima</span>
            <ChevronRight className="size-3.5" />
          </button>
        </nav>
      )}
    </div>
  );
}
