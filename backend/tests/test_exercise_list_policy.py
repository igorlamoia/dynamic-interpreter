import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.models.language import Language, LanguagePolicy
from app.modules.languages.policy import resolve_effective_language


def _lang(name: str) -> Language:
    return Language(id=1, owner_id=1, name=name, customization={"n": name})


def _exercise(policy: LanguagePolicy, language: Language | None) -> Exercise:
    ex = Exercise(teacher_id=1, title="t", description="d", attachments="")
    ex.language_policy = policy
    ex.locked_language = language
    ex.locked_language_id = language.id if language else None
    return ex


def _list(policy: LanguagePolicy, language: Language | None) -> ExerciseList:
    el = ExerciseList(teacher_id=1, title="t", description="d")
    el.language_policy = policy
    el.locked_language = language
    el.locked_language_id = language.id if language else None
    return el


class TestResolveEffectiveLanguage:
    def test_exercise_lock_wins_over_list_lock(self):
        x, y = _lang("X"), _lang("Y")
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.LOCKED, y), _list(LanguagePolicy.LOCKED, x)
        )
        assert effective is y
        assert source == "exercise"

    def test_open_exercise_inherits_list_lock(self):
        x = _lang("X")
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.OPEN, None), _list(LanguagePolicy.LOCKED, x)
        )
        assert effective is x
        assert source == "list"

    def test_exercise_lock_applies_with_open_list(self):
        y = _lang("Y")
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.LOCKED, y), _list(LanguagePolicy.OPEN, None)
        )
        assert effective is y
        assert source == "exercise"

    def test_both_open_leaves_student_free(self):
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.OPEN, None), _list(LanguagePolicy.OPEN, None)
        )
        assert effective is None
        assert source is None

    def test_no_list_falls_back_to_exercise_only(self):
        y = _lang("Y")
        assert resolve_effective_language(_exercise(LanguagePolicy.LOCKED, y), None) == (y, "exercise")
        assert resolve_effective_language(_exercise(LanguagePolicy.OPEN, None), None) == (None, None)
