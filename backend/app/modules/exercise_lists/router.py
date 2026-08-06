from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUserIdDep, SessionDep
from app.modules.exercise_lists.service import (
    add_exercise_to_list,
    create_exercise_list,
    get_exercise_list,
    get_submitted_exercise_ids,
    list_exercise_lists,
    publish_exercise_list,
    remove_exercise_from_list,
    update_exercise_list,
)
from app.schemas.exercise_lists import (
    AddExerciseRequest,
    ExerciseListCreate,
    ExerciseListItemResponse,
    ExerciseListResponse,
    ExerciseListUpdate,
    PublishRequest,
    PublishResponse,
)

router = APIRouter(prefix="/exercise-lists", tags=["exercise-lists"])


@router.get("", response_model=list[ExerciseListResponse])
async def list_exercise_lists_endpoint(user_id: CurrentUserIdDep, session: SessionDep):
    lists = await list_exercise_lists(user_id, session)
    return [ExerciseListResponse.model_validate(el) for el in lists]


@router.post("", response_model=ExerciseListResponse, status_code=201)
async def create_exercise_list_endpoint(
    data: ExerciseListCreate, user_id: CurrentUserIdDep, session: SessionDep
):
    el = await create_exercise_list(user_id, data.title, data.description, session)
    return ExerciseListResponse.model_validate(el)


@router.get("/{list_id}", response_model=ExerciseListResponse)
async def get_exercise_list_endpoint(
    list_id: int,
    user_id: CurrentUserIdDep,
    session: SessionDep,
    class_id: int | None = Query(default=None, alias="classId"),
):
    el = await get_exercise_list(list_id, session, caller_id=user_id)
    response = ExerciseListResponse.model_validate(el)

    if class_id is not None:
        submitted_ids = await get_submitted_exercise_ids(list_id, class_id, user_id, session)
        response.submitted_exercise_ids = submitted_ids

    return response


@router.patch("/{list_id}", response_model=ExerciseListResponse)
async def update_exercise_list_endpoint(
    list_id: int,
    data: ExerciseListUpdate,
    user_id: CurrentUserIdDep,
    session: SessionDep,
):
    el = await update_exercise_list(list_id, user_id, data, session)
    return ExerciseListResponse.model_validate(el)


@router.post("/{list_id}/exercises", response_model=ExerciseListItemResponse, status_code=201)
async def add_exercise_to_list_endpoint(
    list_id: int, data: AddExerciseRequest, user_id: CurrentUserIdDep, session: SessionDep
):
    item = await add_exercise_to_list(
        list_id, data.exercise_id, data.grade_weight, data.order_index, user_id, session
    )
    return ExerciseListItemResponse.model_validate(item)


@router.delete("/{list_id}/exercises", status_code=204)
async def remove_exercise_from_list_endpoint(
    list_id: int,
    user_id: CurrentUserIdDep,
    session: SessionDep,
    exercise_id: int = Query(..., alias="exerciseId"),
):
    await remove_exercise_from_list(list_id, exercise_id, user_id, session)


@router.post("/{list_id}/publish", response_model=PublishResponse)
async def publish_exercise_list_endpoint(
    list_id: int, data: PublishRequest, user_id: CurrentUserIdDep, session: SessionDep
):
    cel = await publish_exercise_list(
        list_id, data.class_id, data.total_grade, data.min_required, data.deadline, user_id, session
    )
    return PublishResponse(
        class_id=cel.class_id,
        exercise_list_id=cel.exercise_list_id,
        total_grade=cel.total_grade,
        min_required=cel.min_required,
        deadline=cel.deadline,
    )
