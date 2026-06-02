from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import init_db
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.classes.router import router as classes_router
from app.modules.exercises.router import router as exercises_router
from app.modules.submissions.router import router as submissions_router
from app.modules.organizations.router import router as organizations_router
from app.modules.exercise_lists.router import router as exercise_lists_router
from app.modules.languages.router import router as languages_router


@asynccontextmanager
async def lifespan(app: FastAPI):  # pragma: no cover
    await init_db()
    yield


app = FastAPI(
    title="TS Compilator API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(classes_router)
app.include_router(exercises_router)
app.include_router(submissions_router)
app.include_router(organizations_router)
app.include_router(exercise_lists_router)
app.include_router(languages_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
