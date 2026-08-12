from fastapi import APIRouter, Query

from app.core.dependencies import AcademicUserIdDep, SessionDep
from app.modules.exercises.service import (
    create_exercise, get_exercise_in_context, list_exercises,
    update_exercise, delete_exercise, add_test_case, delete_test_case
)
from app.schemas.exercises import ExerciseCreate, ExerciseUpdate, ExerciseResponse, TestCaseCreate, TestCaseResponse
from app.schemas.languages import LanguageResponse

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.post("", response_model=ExerciseResponse, status_code=201)
async def create_exercise_endpoint(data: ExerciseCreate, user_id: AcademicUserIdDep, session: SessionDep):
    return await create_exercise(data, user_id, session)


@router.get("", response_model=list[ExerciseResponse])
async def list_exercises_endpoint(user_id: AcademicUserIdDep, session: SessionDep):
    return await list_exercises(user_id, session)


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise_endpoint(
    exercise_id: int,
    user_id: AcademicUserIdDep,
    session: SessionDep,
    list_id: int | None = Query(default=None, alias="listId"),
):
    ctx = await get_exercise_in_context(exercise_id, list_id, user_id, session)
    response = ExerciseResponse.model_validate(ctx.exercise)
    if not ctx.can_read_locked_language:
        # `model_validate` expandiu a relação direto do ORM — o gate só existe
        # se ele for desfeito aqui. `lockedLanguageId` fica: o segredo é o
        # `customization`, e o id o cliente já vê no source.
        response.locked_language = None
    response.effective_language = (
        LanguageResponse.model_validate(ctx.effective_language)
        if ctx.effective_language is not None
        else None
    )
    response.effective_language_source = ctx.effective_language_source
    return response


@router.patch("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise_endpoint(exercise_id: int, data: ExerciseUpdate, user_id: AcademicUserIdDep, session: SessionDep):
    return await update_exercise(exercise_id, user_id, data, session)


@router.delete("/{exercise_id}", status_code=204)
async def delete_exercise_endpoint(exercise_id: int, user_id: AcademicUserIdDep, session: SessionDep):
    await delete_exercise(exercise_id, user_id, session)


@router.post("/{exercise_id}/test-cases", response_model=TestCaseResponse, status_code=201)
async def add_test_case_endpoint(exercise_id: int, data: TestCaseCreate, user_id: AcademicUserIdDep, session: SessionDep):
    return await add_test_case(exercise_id, data, user_id, session)


@router.delete("/{exercise_id}/test-cases/{tc_id}", status_code=204)
async def delete_test_case_endpoint(exercise_id: int, tc_id: int, user_id: AcademicUserIdDep, session: SessionDep):
    await delete_test_case(exercise_id, tc_id, user_id, session)
