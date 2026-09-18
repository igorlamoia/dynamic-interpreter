from datetime import datetime

from pydantic import Field
from typing import Literal
from app.schemas.base import CamelModel
from app.models.language import LanguagePolicy
from app.models.submission import SubmissionStatus
from app.schemas.languages import LanguageResponse


class TestCaseCreate(CamelModel):
    label: str = ""
    input: str
    expected_output: str
    order_index: int = 0


class TestCaseResponse(CamelModel):
    id: int
    exercise_id: int
    label: str
    input: str
    expected_output: str
    order_index: int


class ExerciseCreate(CamelModel):
    title: str
    description: str
    attachments: str = ""
    language_policy: LanguagePolicy = LanguagePolicy.OPEN
    locked_language_id: int | None = None


class ExerciseUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    attachments: str | None = None
    language_policy: LanguagePolicy | None = None
    locked_language_id: int | None = None


class ExerciseSubmissionBrief(CamelModel):
    """O que o workspace do aluno precisa da própria submissão.

    Sem `code_snapshot` nem `language_snapshot`: o workspace só usa status,
    nota e data, e o código não tem por que trafegar a cada abertura.
    """

    id: int
    status: SubmissionStatus
    score: float | None = None
    submitted_at: datetime


class ExerciseResponse(CamelModel):
    id: int
    teacher_id: int
    title: str
    description: str
    attachments: str
    language_policy: LanguagePolicy
    locked_language_id: int | None = None
    locked_language: LanguageResponse | None = None
    created_at: datetime
    updated_at: datetime
    test_cases: list[TestCaseResponse] = []
    effective_language: LanguageResponse | None = None
    effective_language_source: Literal["exercise", "list"] | None = None
    # Serializado como `submissions`, que é o que o workspace lê. O nome do
    # campo é outro de propósito: o ORM `Exercise` tem uma relação
    # `submissions` com as submissões de TODOS os alunos, e um campo com esse
    # nome faria o `model_validate(orm)` carregá-la inteira na resposta. Assim
    # ele nasce vazio e o GET preenche só com as do solicitante.
    submission_history: list[ExerciseSubmissionBrief] = Field(
        default_factory=list, serialization_alias="submissions"
    )
