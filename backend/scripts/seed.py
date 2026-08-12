"""
Seed do banco de dados — porta o seed TypeScript/Prisma para SQLAlchemy async.

Dados criados:
  - 2 organizações: CEFET-MG, UFJF
  - 1 professor + 3 alunos (mesmas credenciais do seed original)
  - 5 linguagens oficiais publicadas no catálogo da comunidade
  - 2 turmas: Programação I (PROG1-2025), Programação II (PROG2-2025)
  - 3 alunos matriculados em ambas as turmas
  - 6 exercícios + 8 test cases
  - 2 listas de exercícios publicadas nas turmas

Uso:
  cd backend
  uv run python scripts/seed.py
"""

import asyncio
import os
import sys
from datetime import UTC, datetime
from pathlib import Path

# Garante que o diretório raiz do backend está no sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

os.environ.setdefault("SECRET_KEY", "seed-script-key")

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.models  # noqa: F401 — registra todos os modelos
from app.core.config import settings
from app.core.security import hash_password
from app.models.class_ import Class
from app.models.class_exercise_list import ClassExerciseList
from app.models.class_member import ClassMember
from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.models.exercise_list_item import ExerciseListItem
from app.models.language import Language
from app.models.organization import Organization
from app.models.test_case import TestCase
from app.models.user import User, UserRole
from app.db.base import Base
from scripts.community_language_presets import COMMUNITY_LANGUAGE_PRESETS


OFFICIAL_LANGUAGE_PUBLISHED_AT = datetime(2026, 8, 12, tzinfo=UTC)


async def get_or_create_org(session: AsyncSession, name: str) -> Organization:
    result = await session.execute(select(Organization).where(Organization.name == name))
    org = result.scalar_one_or_none()
    if not org:
        org = Organization(name=name)
        session.add(org)
        await session.flush()
    return org


async def get_or_create_user(session: AsyncSession, **kwargs) -> User:
    result = await session.execute(select(User).where(User.email == kwargs["email"]))
    user = result.scalar_one_or_none()
    if not user:
        user = User(**kwargs)
        session.add(user)
        await session.flush()
    else:
        for field in ("password", "name", "role", "organization_id", "bio"):
            if field in kwargs:
                setattr(user, field, kwargs[field])
        await session.flush()
    return user


async def seed_community_languages(
    session: AsyncSession, system_user: User
) -> list[Language]:
    """Cria ou reconcilia o acervo oficial sem duplicar registros.

    A identidade é `(owner_id, name)`, a mesma protegida pela unique constraint
    de `languages`. Cópias importadas pertencem a outros usuários e nunca são
    tocadas por uma nova execução do seed.
    """
    languages: list[Language] = []
    for preset in COMMUNITY_LANGUAGE_PRESETS:
        result = await session.execute(
            select(Language).where(
                Language.owner_id == system_user.id,
                Language.name == preset.name,
            )
        )
        language = result.scalar_one_or_none()
        if language is None:
            language = Language(owner_id=system_user.id, name=preset.name)
            session.add(language)

        language.description = preset.description
        language.customization = preset.customization()
        language.image_url = None
        language.image_query = None
        language.preset_id = preset.preset_id
        language.is_public = True
        language.published_at = (
            language.published_at or OFFICIAL_LANGUAGE_PUBLISHED_AT
        )
        languages.append(language)

    await session.flush()
    return languages


async def get_or_create_class(session: AsyncSession, access_code: str, **kwargs) -> Class:
    result = await session.execute(select(Class).where(Class.access_code == access_code))
    cls = result.scalar_one_or_none()
    if not cls:
        cls = Class(access_code=access_code, **kwargs)
        session.add(cls)
        await session.flush()
    return cls


async def get_or_create_exercise(session: AsyncSession, title: str, teacher_id: int, **kwargs) -> Exercise:
    result = await session.execute(
        select(Exercise).where(Exercise.title == title, Exercise.teacher_id == teacher_id)
    )
    ex = result.scalar_one_or_none()
    if not ex:
        ex = Exercise(title=title, teacher_id=teacher_id, **kwargs)
        session.add(ex)
        await session.flush()
    return ex


async def get_or_create_exercise_list(session: AsyncSession, title: str, teacher_id: int, **kwargs) -> ExerciseList:
    result = await session.execute(
        select(ExerciseList).where(ExerciseList.title == title, ExerciseList.teacher_id == teacher_id)
    )
    el = result.scalar_one_or_none()
    if not el:
        el = ExerciseList(title=title, teacher_id=teacher_id, **kwargs)
        session.add(el)
        await session.flush()
    return el


async def seed(session: AsyncSession) -> None:
    # ── Organizations ─────────────────────────────────────────────────────────
    cefet = await get_or_create_org(session, "CEFET-MG")
    _ufjf = await get_or_create_org(session, "UFJF")
    system_org = await get_or_create_org(session, "System")
    print("✅ Organizações: CEFET-MG, UFJF")

    # ── Users ─────────────────────────────────────────────────────────────────
    professor = await get_or_create_user(
        session,
        email="professor@gmail.com",
        password=hash_password("professor"),
        name="Prof. Carlos Silva",
        role=UserRole.TEACHER,
        organization_id=cefet.id,
        bio="Professor de Computação — Programação Java",
    )

    alunos = []
    for email, name in [
        ("aluno@gmail.com",  "Ana Souza"),
        ("aluno2@gmail.com", "Bruno Oliveira"),
        ("aluno3@gmail.com", "Camila Ferreira"),
    ]:
        aluno = await get_or_create_user(
            session,
            email=email,
            password=hash_password("aluno"),
            name=name,
            role=UserRole.STUDENT,
            organization_id=cefet.id,
        )
        alunos.append(aluno)

    system_user = await get_or_create_user(
        session,
        email="system@internal",
        password="!disabled",
        name="Linguagens Oficiais",
        role=UserRole.SYSTEM,
        organization_id=system_org.id,
        bio="Coleção oficial de linguagens prontas da comunidade.",
    )

    print("✅ Usuários: Prof. Carlos Silva, Ana Souza, Bruno Oliveira, Camila Ferreira")

    # ── Community Languages ──────────────────────────────────────────────
    official_languages = await seed_community_languages(session, system_user)
    print(
        "✅ Linguagens oficiais na comunidade: "
        + ", ".join(language.name for language in official_languages)
    )

    # ── Classes ───────────────────────────────────────────────────────────────
    prog1 = await get_or_create_class(
        session,
        access_code="PROG1-2025",
        name="Programação I",
        description="Introdução à Programação com Java — conceitos básicos, variáveis, condicionais e laços.",
        teacher_id=professor.id,
        organization_id=cefet.id,
    )
    prog2 = await get_or_create_class(
        session,
        access_code="PROG2-2025",
        name="Programação II",
        description="Programação Orientada a Objetos com Java — herança, polimorfismo, interfaces e coleções.",
        teacher_id=professor.id,
        organization_id=cefet.id,
    )
    print("✅ Turmas: Programação I (PROG1-2025), Programação II (PROG2-2025)")

    # ── Class Members ─────────────────────────────────────────────────────────
    for cls in [prog1, prog2]:
        for aluno in alunos:
            result = await session.execute(
                select(ClassMember).where(
                    ClassMember.class_id == cls.id,
                    ClassMember.student_id == aluno.id,
                )
            )
            if not result.scalar_one_or_none():
                session.add(ClassMember(class_id=cls.id, student_id=aluno.id))
    await session.flush()
    print("✅ Alunos matriculados nas turmas PROG I e PROG II")

    # ── Exercises ─────────────────────────────────────────────────────────────
    exercises_data = [
        ("Hello World",       "Escreva um programa Java que imprime \"Hello World\" no console. Este é o seu primeiro programa!"),
        ("Soma de Dois Números", "Leia dois números inteiros da entrada padrão e imprima a soma deles."),
        ("Par ou Ímpar",      "Leia um número inteiro e imprima \"PAR\" se for par ou \"IMPAR\" se for ímpar."),
        ("Fatorial",          "Calcule o fatorial de um número inteiro N (N!). Utilize um laço for ou while."),
        ("Classe Retângulo",  "Crie uma classe Retangulo com atributos largura e altura. Implemente métodos para calcular área e perímetro."),
        ("Herança — Animal",  "Crie uma classe base Animal com o método emitirSom(). Crie as subclasses Cachorro e Gato que sobrescrevem o método."),
    ]

    exercises = []
    for title, description in exercises_data:
        ex = await get_or_create_exercise(
            session,
            title=title,
            teacher_id=professor.id,
            description=description,
            attachments="",
        )
        exercises.append(ex)

    ex1, ex2, ex3, ex4, *_ = exercises
    print("✅ 6 exercícios criados pelo professor")

    # ── Test Cases ────────────────────────────────────────────────────────────
    test_cases_data = [
        # Hello World
        (ex1.id, "Saída padrão",   "",       "Hello World", 0),
        # Soma
        (ex2.id, "Caso 2+3",       "2\n3",   "5",           0),
        (ex2.id, "Caso 10+20",     "10\n20", "30",          1),
        # Par ou Ímpar
        (ex3.id, "Número par",     "4",      "PAR",         0),
        (ex3.id, "Número ímpar",   "7",      "IMPAR",       1),
        # Fatorial
        (ex4.id, "Fatorial de 5",  "5",      "120",         0),
        (ex4.id, "Fatorial de 0",  "0",      "1",           1),
        (ex4.id, "Fatorial de 10", "10",     "3628800",     2),
    ]

    for exercise_id, label, input_, expected_output, order_index in test_cases_data:
        result = await session.execute(
            select(TestCase).where(
                TestCase.exercise_id == exercise_id,
                TestCase.label == label,
            )
        )
        if not result.scalar_one_or_none():
            session.add(TestCase(
                exercise_id=exercise_id,
                label=label,
                input=input_,
                expected_output=expected_output,
                order_index=order_index,
            ))
    await session.flush()
    print("✅ 8 casos de teste criados")

    # ── Exercise Lists ────────────────────────────────────────────────────────
    list1 = await get_or_create_exercise_list(
        session,
        title="Lista 1 — Fundamentos",
        teacher_id=professor.id,
        description="Exercícios básicos de Java: Hello World, soma, condicionais e laços.",
    )
    list2 = await get_or_create_exercise_list(
        session,
        title="Lista 2 — POO",
        teacher_id=professor.id,
        description="Exercícios de Programação Orientada a Objetos: classes, herança e polimorfismo.",
    )

    list1_items = [
        (ex1.id, 1.0, 0),
        (ex2.id, 2.0, 1),
        (ex3.id, 2.0, 2),
        (ex4.id, 5.0, 3),
    ]
    list2_items = [
        (exercises[4].id, 5.0, 0),
        (exercises[5].id, 5.0, 1),
    ]

    for el, items in [(list1, list1_items), (list2, list2_items)]:
        for exercise_id, grade_weight, order_index in items:
            result = await session.execute(
                select(ExerciseListItem).where(
                    ExerciseListItem.exercise_list_id == el.id,
                    ExerciseListItem.exercise_id == exercise_id,
                )
            )
            if not result.scalar_one_or_none():
                session.add(ExerciseListItem(
                    exercise_list_id=el.id,
                    exercise_id=exercise_id,
                    grade_weight=grade_weight,
                    order_index=order_index,
                ))
    await session.flush()
    print("✅ 2 listas de exercícios criadas (4 + 2 exercícios)")

    # ── Publish Lists to Classes ──────────────────────────────────────────────
    publications = [
        (list1.id, prog1.id, datetime(2025, 7, 15, 23, 59, 59), 10.0, 3),
        (list2.id, prog2.id, datetime(2025, 8, 30, 23, 59, 59), 10.0, 1),
    ]

    for exercise_list_id, class_id, deadline, total_grade, min_required in publications:
        result = await session.execute(
            select(ClassExerciseList).where(
                ClassExerciseList.exercise_list_id == exercise_list_id,
                ClassExerciseList.class_id == class_id,
            )
        )
        if not result.scalar_one_or_none():
            session.add(ClassExerciseList(
                exercise_list_id=exercise_list_id,
                class_id=class_id,
                deadline=deadline,
                total_grade=total_grade,
                min_required=min_required,
            ))
    await session.flush()
    print("✅ Listas publicadas: Lista 1 → PROG I, Lista 2 → PROG II")


async def main() -> None:
    print("🌱 Seeding database...\n")

    engine_kwargs: dict = {"echo": False}
    if settings.database_url.startswith("postgresql"):
        engine_kwargs["connect_args"] = {
            "server_settings": {"search_path": settings.database_schema}
        }

    engine = create_async_engine(settings.database_url, **engine_kwargs)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"✅ Tabelas verificadas/criadas no schema '{settings.database_schema}'\n")

    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        async with session.begin():
            await seed(session)

    await engine.dispose()

    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("🎉 Seed completo! Credenciais:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    print("👨‍🏫 Professor:")
    print("   Email: professor@gmail.com")
    print("   Senha: professor")
    print()
    print("👩‍🎓 Aluna 1 (Ana Souza):")
    print("   Email: aluno@gmail.com")
    print("   Senha: aluno")
    print()
    print("👨‍🎓 Aluno 2 (Bruno Oliveira):")
    print("   Email: aluno2@gmail.com")
    print("   Senha: aluno")
    print()
    print("👩‍🎓 Aluna 3 (Camila Ferreira):")
    print("   Email: aluno3@gmail.com")
    print("   Senha: aluno")
    print()
    print("📚 Turmas:")
    print("   PROG I  — Código: PROG1-2025")
    print("   PROG II — Código: PROG2-2025")
    print()
    print("🧬 Linguagens oficiais publicadas:")
    for preset in COMMUNITY_LANGUAGE_PRESETS:
        print(f"   {preset.name}")
    print()
    print("📝 Listas publicadas:")
    print("   Lista 1 (Fundamentos)  → PROG I  — 4 exercícios")
    print("   Lista 2 (POO)          → PROG II — 2 exercícios")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")


if __name__ == "__main__":
    asyncio.run(main())
