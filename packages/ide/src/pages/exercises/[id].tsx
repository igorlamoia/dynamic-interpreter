import { useRouter } from 'next/router';
import ExerciseWorkspace from "@/components/exercise-workspace";
import { t } from "@/i18n";

export default function ExercisePage() {
    const router = useRouter();
    const { id, listId, classId } = router.query;

    if (!id || typeof id !== 'string') {
        return <div className="p-8 text-white">{t(router.locale, "ui.loading")}</div>;
    }

    return (
        <ExerciseWorkspace
            exerciseId={id}
            listId={typeof listId === 'string' ? listId : undefined}
            classId={typeof classId === 'string' ? classId : undefined}
        />
    );
}

ExercisePage.requireAuth = true;
