import { useRouter } from 'next/router';
import ExerciseWorkspace from "@/components/exercise-workspace";

export default function ExercisePage() {
    const router = useRouter();
    const { id, listId, classId } = router.query;

    if (!id || typeof id !== 'string') return <div className="p-8 text-white">Carregando...</div>;

    return (
        <ExerciseWorkspace
            exerciseId={id}
            listId={typeof listId === 'string' ? listId : undefined}
            classId={typeof classId === 'string' ? classId : undefined}
        />
    );
}

ExercisePage.requireAuth = true;
