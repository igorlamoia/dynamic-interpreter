import "./_theme";
import { forwardRef, useRef, type ReactNode } from "react";
import { AnimatedBeam } from "@ts-compilator-for-java/ide";
import { FileCode2, ScanText, ListTree, Cpu, TerminalSquare, GraduationCap, User } from "lucide-react";

const Node = forwardRef<HTMLDivElement, { children: ReactNode; label: string; accent?: boolean }>(
  ({ children, label, accent }, ref) => (
    <div className="z-10 flex flex-col items-center gap-2">
      <div
        ref={ref}
        className={
          "flex size-12 items-center justify-center rounded-full border-2 bg-background p-3 " +
          (accent ? "border-primary/60 text-primary" : "border-border text-foreground")
        }
      >
        {children}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  ),
);
Node.displayName = "Node";

function PipelineBeams() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const lexerRef = useRef<HTMLDivElement>(null);
  const parserRef = useRef<HTMLDivElement>(null);
  const irRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      className="relative flex w-full max-w-2xl items-center justify-between overflow-hidden rounded-lg border border-border bg-card/40 px-8 py-10"
    >
      <Node ref={sourceRef} label="main.java">
        <FileCode2 className="size-5" />
      </Node>
      <Node ref={lexerRef} label="Léxico">
        <ScanText className="size-5" />
      </Node>
      <Node ref={parserRef} label="Sintático">
        <ListTree className="size-5" />
      </Node>
      <Node ref={irRef} label="Código intermediário">
        <Cpu className="size-5" />
      </Node>
      <Node ref={outputRef} label="Terminal" accent>
        <TerminalSquare className="size-5" />
      </Node>
      <AnimatedBeam containerRef={containerRef} fromRef={sourceRef} toRef={lexerRef} duration={4} />
      <AnimatedBeam containerRef={containerRef} fromRef={lexerRef} toRef={parserRef} duration={4} delay={0.3} />
      <AnimatedBeam containerRef={containerRef} fromRef={parserRef} toRef={irRef} duration={4} delay={0.6} />
      <AnimatedBeam containerRef={containerRef} fromRef={irRef} toRef={outputRef} duration={4} delay={0.9} />
    </div>
  );
}

function ClassroomBeams({ reverse }: { reverse?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const teacherRef = useRef<HTMLDivElement>(null);
  const s1 = useRef<HTMLDivElement>(null);
  const s2 = useRef<HTMLDivElement>(null);
  const s3 = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      className="relative flex w-full max-w-xl items-center justify-between overflow-hidden rounded-lg border border-border bg-card/40 px-10 py-8"
    >
      <Node ref={teacherRef} label="Professora" accent>
        <GraduationCap className="size-5" />
      </Node>
      <div className="flex flex-col gap-6">
        <Node ref={s1} label="Ana Souza">
          <User className="size-5" />
        </Node>
        <Node ref={s2} label="Bruno Lima">
          <User className="size-5" />
        </Node>
        <Node ref={s3} label="Carla Dias">
          <User className="size-5" />
        </Node>
      </div>
      {[s1, s2, s3].map((ref, i) => (
        <AnimatedBeam
          key={i}
          containerRef={containerRef}
          fromRef={teacherRef}
          toRef={ref}
          fromAnchor="right"
          toAnchor="left"
          curvature={(1 - i) * 40}
          reverse={reverse}
          pathOpacity={0.22}
          duration={5}
          delay={i * 0.2}
          gradientStartColor={reverse ? "#34d399" : undefined}
          gradientStopColor={reverse ? "#a3e635" : undefined}
        />
      ))}
    </div>
  );
}

export const CompilerPipeline = () => (
  <div className="flex justify-center p-6">
    <PipelineBeams />
  </div>
);

export const ExerciseDistribution = () => (
  <div className="flex justify-center p-6">
    <ClassroomBeams />
  </div>
);

export const SubmissionsReverse = () => (
  <div className="flex justify-center p-6">
    <ClassroomBeams reverse />
  </div>
);
