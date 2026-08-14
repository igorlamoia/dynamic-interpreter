from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.submission import Submission, SubmissionStatus
from app.models.user import User, UserRole
from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.modules.languages.policy import resolve_effective_language
from app.schemas.submissions import SubmissionCreate, SubmissionGrade


async def create_submission(data: SubmissionCreate, student_id: str, session: AsyncSession) -> Submission:
    result = await session.execute(
        select(Exercise)
        .where(Exercise.id == data.exercise_id)
        .options(selectinload(Exercise.locked_language))
    )
    exercise = result.scalar_one_or_none()
    if exercise is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    list_result = await session.execute(
        select(ExerciseList)
        .where(ExerciseList.id == data.exercise_list_id)
        .options(selectinload(ExerciseList.locked_language))
    )
    exercise_list = list_result.scalar_one_or_none()

    # Override no servidor: o aluno não burla a trava mexendo no keywordMap.
    # Vale para a trava do exercício e para a herdada da lista.
    effective, _ = resolve_effective_language(exercise, exercise_list)
    language_snapshot = (
        dict(effective.customization) if effective is not None else data.language_snapshot
    )

    submission = Submission(
        exercise_id=data.exercise_id,
        exercise_list_id=data.exercise_list_id,
        class_id=data.class_id,
        student_id=student_id,
        code_snapshot=data.code_snapshot,
        language_snapshot=language_snapshot,
        status=data.status,
    )
    session.add(submission)
    await session.flush()
    return submission


async def list_submissions(current_user_id: str, session: AsyncSession) -> list[Submission]:
    current_user = await session.get(User, current_user_id)
    if current_user.role == UserRole.STUDENT:
        result = await session.execute(
            select(Submission).where(Submission.student_id == current_user_id)
        )
    else:
        # Teacher sees submissions for exercises they created
        result = await session.execute(
            select(Submission)
            .join(Exercise, Submission.exercise_id == Exercise.id)
            .where(Exercise.teacher_id == current_user_id)
        )
    return list(result.scalars().all())


async def get_submission(submission_id: str, current_user_id: str, session: AsyncSession) -> Submission:
    sub = await session.get(Submission, submission_id)
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    current_user = await session.get(User, current_user_id)
    if current_user.role == UserRole.STUDENT and sub.student_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    return sub


async def grade_submission(
    submission_id: str,
    current_user_id: str,
    data: SubmissionGrade,
    session: AsyncSession,
) -> Submission:
    current_user = await session.get(User, current_user_id)
    if current_user.role == UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can grade")

    sub = await get_submission(submission_id, current_user_id, session)
    sub.score = data.score
    sub.teacher_feedback = data.teacher_feedback
    sub.status = SubmissionStatus.GRADED

    await session.flush()
    return sub
