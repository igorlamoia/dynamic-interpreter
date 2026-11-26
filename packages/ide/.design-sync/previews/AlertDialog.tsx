import "./_theme";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ts-compilator-for-java/ide";

export const RemoveExercise = () => (
  <AlertDialog defaultOpen>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remover exercício da lista?</AlertDialogTitle>
        <AlertDialogDescription>
          &quot;Soma dos pares&quot; deixará de aparecer em &quot;Estruturas de
          repetição&quot;. As submissões já enviadas pelos alunos continuam
          salvas.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
          Remover
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const ConfirmSubmission = () => (
  <AlertDialog defaultOpen>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Enviar solução para correção?</AlertDialogTitle>
        <AlertDialogDescription>
          O código de <code className="font-mono">main.java</code> será
          compilado e comparado com os casos de teste. Depois do envio não é
          possível editar esta submissão.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Revisar código</AlertDialogCancel>
        <AlertDialogAction>Enviar</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
