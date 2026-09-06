import math
from fastapi import APIRouter, Query

from app.core.dependencies import AcademicUserIdDep, SessionDep
from app.modules.submissions.service import (
    create_submission,
    list_submissions,
    list_submissions_paginated,
    get_submission,
    grade_submission,
)
from app.schemas.pagination import PaginatedResponse
from app.schemas.submissions import SubmissionCreate, SubmissionGrade, SubmissionResponse

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("", response_model=SubmissionResponse, status_code=201)
async def create_submission_endpoint(
    data: SubmissionCreate, user_id: AcademicUserIdDep, session: SessionDep
):
    return await create_submission(data, user_id, session)


@router.get("", response_model=PaginatedResponse[SubmissionResponse] | list[SubmissionResponse])
async def list_submissions_endpoint(
    user_id: AcademicUserIdDep,
    session: SessionDep,
    exercise_id: int | None = Query(default=None, alias="exerciseId"),
    exercise_list_id: int | None = Query(default=None, alias="exerciseListId"),
    page: int | None = Query(default=None, ge=1),
    page_size: int = Query(default=10, ge=1, le=100, alias="pageSize"),
):
    if page is not None:
        items, total = await list_submissions_paginated(
            user_id,
            session,
            exercise_id=exercise_id,
            exercise_list_id=exercise_list_id,
            page=page,
            page_size=page_size,
        )
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )
    return await list_submissions(
        user_id, session, exercise_id=exercise_id, exercise_list_id=exercise_list_id
    )


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission_endpoint(
    submission_id: str, user_id: AcademicUserIdDep, session: SessionDep
):
    return await get_submission(submission_id, user_id, session)


@router.patch("/{submission_id}/grade", response_model=SubmissionResponse)
@router.patch("/{submission_id}", response_model=SubmissionResponse)
async def grade_submission_endpoint(
    submission_id: str,
    data: SubmissionGrade,
    user_id: AcademicUserIdDep,
    session: SessionDep,
):
    return await grade_submission(submission_id, user_id, data, session)
