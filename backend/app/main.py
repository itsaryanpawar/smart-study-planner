import os

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, engine
from app.routers import dashboard, sessions, subjects, tasks


def create_app() -> FastAPI:
    app = FastAPI(
        title="Smart Study Planner API",
        description="REST API for managing subjects, study tasks, schedules, and dashboard analytics.",
        version="1.0.0",
    )

    frontend_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in frontend_origins if origin.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"message": exc.detail},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "message": "Validation error.",
                "errors": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(_: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Unexpected server error: {exc}"},
        )

    @app.get("/", tags=["Health"])
    def health_check():
        return {"message": "Smart Study Planner API is running."}

    app.include_router(subjects.router)
    app.include_router(tasks.router)
    app.include_router(sessions.router)
    app.include_router(dashboard.router)

    return app


app = create_app()
