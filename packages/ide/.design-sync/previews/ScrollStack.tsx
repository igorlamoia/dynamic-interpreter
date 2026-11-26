import "./_theme";
import { ScrollStack, ScrollStackItem } from "@ts-compilator-for-java/ide";
import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

const lessons = [
  { tag: "Aula 1", title: "Variáveis e tipos", body: "Declare int, float e string e mostre valores com print.", tone: "dark:bg-sky-900/55 border-blue-500" },
  { tag: "Aula 2", title: "Condicionais", body: "Use if e else para decidir o fluxo do programa.", tone: "dark:bg-fuchsia-900/55 border-purple-500" },
  { tag: "Aula 3", title: "Laços de repetição", body: "while e for para repetir instruções até uma condição.", tone: "dark:bg-amber-900/55 border-yellow-500" },
  { tag: "Aula 4", title: "Entrada de dados", body: "Leia valores do terminal com scan e valide a entrada.", tone: "dark:bg-rose-900/55 border-red-500" },
];

// Static previews can't scroll; this wrapper scrolls the stack to `top` on
// mount so the pinned/stacked state is visible in a screenshot.
const ScrolledTo = ({ top, children }: { top: number; children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const scroller = ref.current?.querySelector(".scroll-stack-inner")?.parentElement;
    scroller?.scrollTo({ top, behavior: "instant" as ScrollBehavior });
  }, [top]);
  return (
    <div ref={ref} className="h-full">
      {children}
    </div>
  );
};

const LessonCards = () =>
  lessons.map((l) => (
    <ScrollStackItem
      key={l.tag}
      itemClassName="h-48 rounded-3xl bg-background text-foreground shadow-lg dark:shadow-black/50"
    >
      <div className={`h-full rounded-3xl border p-8 ${l.tone}`}>
        <p className="text-xs uppercase tracking-widest text-primary">{l.tag}</p>
        <h3 className="mt-2 text-2xl font-bold">{l.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{l.body}</p>
      </div>
    </ScrollStackItem>
  ));

export const AtRest = () => (
  <div className="flex justify-center p-6">
    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background px-6" style={{ height: 420 }}>
      <ScrollStack itemDistance={60}>
        <LessonCards />
      </ScrollStack>
    </div>
  </div>
);

export const Stacked = () => (
  <div className="flex justify-center p-6">
    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background px-6" style={{ height: 420 }}>
      <ScrolledTo top={520}>
        <ScrollStack itemDistance={60} itemStackDistance={24} baseScale={0.88}>
          <LessonCards />
        </ScrollStack>
      </ScrolledTo>
    </div>
  </div>
);

export const WithRotation = () => (
  <div className="flex justify-center p-6">
    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background px-6" style={{ height: 420 }}>
      <ScrolledTo top={520}>
        <ScrollStack itemDistance={60} itemStackDistance={24} rotationAmount={2} baseScale={0.85}>
          <LessonCards />
        </ScrollStack>
      </ScrolledTo>
    </div>
  </div>
);
