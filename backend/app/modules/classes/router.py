from fastapi import APIRouter

from app.core.dependencies import AcademicUserIdDep, SessionDep
from app.modules.classes.service import (
    create_class, list_classes, get_class, remove_member,
    join_class_by_code, get_class_members, get_class_exercise_lists,
)
from app.schemas.classes import (
    ClassCreate, ClassResponse, JoinClassRequest, JoinClassResponse,
    ClassExerciseListWithProgress, ClassMembersResponse,
)

router = APIRouter(prefix="/classes", tags=["classes"])


@router.post("", response_model=ClassResponse, status_code=201)
async def create_class_endpoint(data: ClassCreate, user_id: AcademicUserIdDep, session: SessionDep):
    return await create_class(data, user_id, session)


@router.get("", response_model=list[ClassResponse])
async def list_classes_endpoint(user_id: AcademicUserIdDep, session: SessionDep):
    return await list_classes(user_id, session)


@router.post("/join", response_model=JoinClassResponse)
async def join_class_by_code_endpoint(data: JoinClassRequest, user_id: AcademicUserIdDep, session: SessionDep):
    return await join_class_by_code(data.access_code, user_id, session)


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class_endpoint(class_id: int, user_id: AcademicUserIdDep, session: SessionDep):
    return await get_class(class_id, session)


@router.get("/{class_id}/members", response_model=ClassMembersResponse)
async def get_class_members_endpoint(class_id: int, user_id: AcademicUserIdDep, session: SessionDep):
    return await get_class_members(class_id, user_id, session)


@router.get("/{class_id}/exercise-lists", response_model=list[ClassExerciseListWithProgress])
async def get_class_exercise_lists_endpoint(class_id: int, user_id: AcademicUserIdDep, session: SessionDep):
    return await get_class_exercise_lists(class_id, user_id, session)


@router.delete("/{class_id}/members/{student_id}", status_code=204)
async def remove_member_endpoint(class_id: int, student_id: int, user_id: AcademicUserIdDep, session: SessionDep):
    await remove_member(class_id, student_id, user_id, session)
