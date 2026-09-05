from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.submission import Submission, SubmissionStatus
from app.models.user import User, UserRole
from app.models.exercise import Exercise, LanguagePolicy
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

    # Delete any existing previous submissions by this student for this exercise and list/class
    # to guarantee that resubmissions replace the old one without duplicates.
    existing_query = select(Submission).where(
        Submission.student_id == int(student_id),
        Submission.exercise_id == data.exercise_id,
    )
    if data.exercise_list_id is not None:
        existing_query = existing_query.where(
            Submission.exercise_list_id == data.exercise_list_id,
            Submission.class_id == data.class_id,
        )
    existing_res = await session.execute(existing_query)
    for old_sub in existing_res.scalars().all():
        await session.delete(old_sub)
    await session.flush()

    submission = Submission(
        exercise_id=data.exercise_id,
        exercise_list_id=data.exercise_list_id,
        class_id=data.class_id,
        student_id=int(student_id),
        code_snapshot=data.code_snapshot,
        language_snapshot=language_snapshot,
        status=data.status,
    )
    session.add(submission)
    await session.flush()
    await session.refresh(submission, attribute_names=["exercise", "student"])
    return submission


async def list_submissions(
    current_user_id: str,
    session: AsyncSession,
    exercise_id: int | None = None,
    exercise_list_id: int | None = None,
) -> list[Submission]:
    current_user = await session.get(User, current_user_id)
    if current_user.role == UserRole.STUDENT:
        query = select(Submission).where(Submission.student_id == current_user_id)
    else:
        # Teacher sees submissions for exercises or exercise lists they created
        query = (
            select(Submission)
            .join(Exercise, Submission.exercise_id == Exercise.id)
            .outerjoin(ExerciseList, Submission.exercise_list_id == ExerciseList.id)
            .where(
                (Exercise.teacher_id == current_user_id) | (ExerciseList.teacher_id == current_user_id)
            )
        )
    if exercise_id is not None:
        query = query.where(Submission.exercise_id == exercise_id)
    if exercise_list_id is not None:
        query = query.where(Submission.exercise_list_id == exercise_list_id)

    query = (
        query.distinct()
        .options(
            selectinload(Submission.student),
            selectinload(Submission.exercise),
        )
        .order_by(Submission.submitted_at.desc())
    )
    result = await session.execute(query)
    subs = list(result.scalars().all())

    # Keep only the latest submission per (student_id, exercise_id, exercise_list_id) to guard against any historical duplicates
    seen = set()
    unique_subs = []
    for s in subs:
        key = (s.student_id, s.exercise_id, s.exercise_list_id)
        if key not in seen:
            seen.add(key)
            unique_subs.append(s)

    return unique_subs


async def get_submission(submission_id: str, current_user_id: str, session: AsyncSession) -> Submission:
    result = await session.execute(
        select(Submission)
        .where(Submission.id == int(submission_id))
        .options(
            selectinload(Submission.student),
            selectinload(Submission.exercise),
        )
    )
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    current_user = await session.get(User, current_user_id)
    if current_user.role == UserRole.STUDENT and str(sub.student_id) != str(current_user_id):
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
    await session.refresh(sub, attribute_names=["exercise", "student"])
    return sub
