import "./_theme";
import { AnimatedList } from "@ts-compilator-for-java/ide";
import { CheckCircle2, XCircle, Clock, Send, BookOpen, UserPlus } from "lucide-react";
import type { ReactNode } from "react";

const submissions = [
  { name: "Ana Souza", exercise: "Fatorial com while", status: "Aceito", time: "agora", tone: "ok" },
  { name: "Bruno Lima", exercise: "Soma de pares", status: "Saída incorreta", time: "1 min", tone: "fail" },
  { name: "Carla Dias", exercise: "Tabuada com for", status: "Aceito", time: "3 min", tone: "ok" },
  { name: "Diego Rocha", exercise: "Maior de três números", status: "Em correção", time: "5 min", tone: "wait" },
];

const toneIcon: Record<string, ReactNode> = {
  ok: <CheckCircle2 className="size-5 text-emerald-400" />,
  fail: <XCircle className="size-5 text-red-400" />,
  wait: <Clock className="size-5 text-amber-400" />,
};

const activity = [
  { icon: <Send className="size-4" />, title: "Nova lista publicada", body: "Estruturas de repetição — 6 exercícios" },
  { icon: <UserPlus className="size-4" />, title: "Aluno entrou na turma", body: "Eduarda Melo entrou em Algoritmos I" },
  { icon: <BookOpen className="size-4" />, title: "Prazo se aproximando", body: "Vetores e strings encerra amanhã às 23:59" },
];

export const SubmissionFeed = () => (
  <div className="flex justify-center p-6">
    <AnimatedList delay={0} className="w-full max-w-md">
      {submissions.map((s) => (
        <figure
          key={s.name}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm"
        >
          {toneIcon[s.tone]}
          <div className="flex min-w-0 flex-1 flex-col">
            <figcaption className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="truncate">{s.name}</span>
              <span className="text-xs text-muted-foreground">· {s.time}</span>
            </figcaption>
            <p className="truncate text-sm text-muted-foreground">
              {s.exercise} — {s.status}
            </p>
          </div>
        </figure>
      ))}
    </AnimatedList>
  </div>
);

export const ClassActivity = () => (
  <div className="flex justify-center p-6">
    <AnimatedList delay={0} className="w-full max-w-sm gap-2">
      {activity.map((a) => (
        <div
          key={a.title}
          className="flex w-full items-start gap-3 rounded-lg border border-border bg-background/80 px-3 py-2.5"
        >
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            {a.icon}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{a.title}</span>
            <span className="text-xs text-muted-foreground">{a.body}</span>
          </div>
        </div>
      ))}
    </AnimatedList>
  </div>
);
