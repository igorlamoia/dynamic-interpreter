import "./_theme";
import { Button, Pointer } from "@ts-compilator-for-java/ide";
import { Play } from "lucide-react";
import { useEffect } from "react";

// Pointer only appears after a real mousemove. For a static preview this
// helper fires a synthetic move over the element with `targetId`;
// `initial={false}` on Pointer skips its fade-in so a still frame shows it.
const HoverAt = ({ targetId }: { targetId: string }) => {
  useEffect(() => {
    const move = () => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const r = el.getBoundingClientRect();
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: r.left + r.width * 0.5,
          clientY: r.top + r.height * 0.45,
          bubbles: true,
        }),
      );
    };
    const timers = [0, 30, 100, 250].map((ms) => setTimeout(move, ms));
    return () => timers.forEach(clearTimeout);
  }, [targetId]);
  return null;
};

const Caption = ({ children }: { children: string }) => (
  <p className="mt-4 text-xs text-muted-foreground">{children}</p>
);

export const OverButton = () => (
  <div className="p-6">
    <div className="flex h-48 max-w-xl flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40">
      <Button id="pointer-run">
        <Play /> Compilar e executar
      </Button>
      <Caption>Sobre botões e links o cursor vira o ponteiro de clique.</Caption>
    </div>
    <Pointer initial={false} />
    <HoverAt targetId="pointer-run" />
  </div>
);

export const OverEditor = () => (
  <div className="p-6">
    <div className="max-w-xl rounded-xl border border-border bg-card/40 p-4">
      <pre
        id="pointer-editor"
        className="cursor-text rounded-lg border border-border dark:bg-black/30 p-4 font-mono text-sm leading-relaxed text-foreground"
      >
        {"int main() {\n  int n;\n  scan(n);\n  print(n * 2);\n}"}
      </pre>
      <Caption>Em áreas com cursor-text (como o editor) o cursor vira a barra de texto.</Caption>
    </div>
    <Pointer initial={false} />
    <HoverAt targetId="pointer-editor" />
  </div>
);

export const Disabled = () => (
  <div className="p-6">
    <div className="flex h-48 max-w-xl flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40">
      {/* Button's disabled state sets pointer-events:none, so the hovered element is the wrapper. */}
      <span id="pointer-disabled" className="inline-flex cursor-not-allowed">
        <Button variant="outline" disabled>
          Enviar solução (prazo encerrado)
        </Button>
      </span>
      <Caption>Com cursor-not-allowed no contêiner, o cursor vira o sinal de bloqueio.</Caption>
    </div>
    <Pointer initial={false} />
    <HoverAt targetId="pointer-disabled" />
  </div>
);

export const CustomCursor = () => (
  <div className="p-6">
    <div
      id="pointer-custom"
      className="flex h-48 max-w-xl items-end justify-center rounded-xl border border-dashed border-border bg-card/40 pb-4"
    >
      <Caption>Cursor personalizado, como na correção colaborativa.</Caption>
    </div>
    <Pointer initial={false}>
      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground shadow-lg">
        Prof. Marina
      </span>
    </Pointer>
    <HoverAt targetId="pointer-custom" />
  </div>
);
