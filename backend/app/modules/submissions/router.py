from fastapi import APIRouter

from app.core.dependencies import AcademicUserIdDep, SessionDep
from app.modules.submissions.service import (
    create_submission,
    list_submissions,
    get_submission,
    grade_submission,
)
from app.schemas.submissions import SubmissionCreate, SubmissionGrade, SubmissionResponse

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("", response_model=SubmissionResponse, status_code=201)
async def create_submission_endpoint(
    data: SubmissionCreate, user_id: AcademicUserIdDep, session: SessionDep
):
    return await create_submission(data, user_id, session)


@router.get("", response_model=list[SubmissionResponse])
async def list_submissions_endpoint(user_id: AcademicUserIdDep, session: SessionDep):
    return await list_submissions(user_id, session)


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission_endpoint(
    submission_id: str, user_id: AcademicUserIdDep, session: SessionDep
):
    return await get_submission(submission_id, user_id, session)


@router.patch("/{submission_id}/grade", response_model=SubmissionResponse)
async def grade_submission_endpoint(
    submission_id: str,
    data: SubmissionGrade,
    user_id: AcademicUserIdDep,
    session: SessionDep,
):
    return await grade_submission(submission_id, user_id, data, session)
