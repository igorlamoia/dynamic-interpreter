"""GET /exercises/{id} expõe as submissões do próprio solicitante.

O workspace do aluno lê `exercise.submissions[0]` para mostrar o badge
"Enviado", a nota e a data da última submissão. Sem esse campo, tudo isso
sumia ao recarregar a página, mesmo com a submissão persistida.

O ORM `Exercise` tem uma relação `submissions` com as submissões de TODOS os
alunos. O campo da resposta precisa ser preenchido só com as do solicitante,
senão um aluno receberia o código dos colegas.
"""

import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from datetime import datetime, timezone

from app.models.class_member import ClassMember
from app.models.exercise_list_item import ExerciseListItem
from app.models.submission import Submission, SubmissionStatus
from app.models.user import UserRole
from tests.factories import (
    create_class,
    create_class_exercise_list,
    create_exercise,
    create_exercise_list,
    create_organization,
    create_user,
)


async def _token(async_client, email: str) -> str:
    response = await async_client.post(
        "/auth/login", json={"email": email, "password": "secret123"}
    )
    assert response.status_code == 200, response.text
    return response.json()["accessToken"]


async def _scenario(async_session):
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, email="own_t@x.com", role=UserRole.TEACHER)
    alice = await create_user(async_session, org, email="own_alice@x.com")
    bob = await create_user(async_session, org, email="own_bob@x.com")
    cls = await create_class(async_session, org, teacher)
    async_session.add(ClassMember(class_id=cls.id, student_id=alice.id))
    async_session.add(ClassMember(class_id=cls.id, student_id=bob.id))
    exercise_list = await create_exercise_list(async_session, teacher)
    exercise = await create_exercise(async_session, teacher)
    async_session.add(
        ExerciseListItem(
            exercise_list_id=exercise_list.id,
            exercise_id=exercise.id,
            grade_weight=10.0,
            order_index=0,
        )
    )
    await create_class_exercise_list(async_session, exercise_list, cls)

    def submission(student, status, score, submitted_at, code):
        return Submission(
            exercise_id=exercise.id,
            exercise_list_id=exercise_list.id,
            class_id=cls.id,
            student_id=student.id,
            code_snapshot=code,
            language_snapshot={},
            status=status,
            score=score,
            submitted_at=submitted_at,
        )

    async_session.add_all(
        [
            submission(alice, SubmissionStatus.SUBMITTED, None,
                       datetime(2026, 1, 1, tzinfo=timezone.utc), "alice-v1"),
            submission(alice, SubmissionStatus.GRADED, 8.5,
                       datetime(2026, 1, 2, tzinfo=timezone.utc), "alice-v2"),
            submission(bob, SubmissionStatus.SUBMITTED, None,
                       datetime(2026, 1, 3, tzinfo=timezone.utc), "bob-secret-code"),
        ]
    )
    await async_session.flush()
    return exercise, exercise_list


async def test_student_sees_own_submissions_newest_first(async_client, async_session):
    exercise, exercise_list = await _scenario(async_session)
    token = await _token(async_client, "own_alice@x.com")

    response = await async_client.get(
        f"/exercises/{exercise.id}?listId={exercise_list.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200, response.text
    submissions = response.json()["submissions"]
    assert [s["status"] for s in submissions] == ["GRADED", "SUBMITTED"]
    assert submissions[0]["score"] == 8.5
    assert "submittedAt" in submissions[0]


async def test_student_never_receives_other_students_submissions(async_client, async_session):
    exercise, exercise_list = await _scenario(async_session)
    token = await _token(async_client, "own_alice@x.com")

    response = await async_client.get(
        f"/exercises/{exercise.id}?listId={exercise_list.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    # Sem esta checagem o teste passaria vacuamente numa resposta de erro.
    assert response.status_code == 200, response.text
    body = response.text
    assert "bob-secret-code" not in body
    assert len(response.json()["submissions"]) == 2


async def test_submissions_do_not_carry_code_snapshot(async_client, async_session):
    exercise, exercise_list = await _scenario(async_session)
    token = await _token(async_client, "own_alice@x.com")

    response = await async_client.get(
        f"/exercises/{exercise.id}?listId={exercise_list.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200, response.text
    for submission in response.json()["submissions"]:
        assert "codeSnapshot" not in submission
    assert "alice-v1" not in response.text


async def test_teacher_gets_empty_submissions(async_client, async_session):
    exercise, exercise_list = await _scenario(async_session)
    token = await _token(async_client, "own_t@x.com")

    response = await async_client.get(
        f"/exercises/{exercise.id}?listId={exercise_list.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200, response.text
    assert response.json()["submissions"] == []
