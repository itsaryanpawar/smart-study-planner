from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import create_app
from app.models import StudySession, Subject, Task


@pytest.fixture()
def client(tmp_path):
    database_path = tmp_path / "test.db"
    engine = create_engine(f"sqlite:///{database_path}", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    app = create_app()

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def seeded_data(client):
    db = next(client.app.dependency_overrides[get_db]())

    math = Subject(name="Mathematics", color="#2563eb", description="Algebra and calculus")
    science = Subject(name="Science", color="#10b981", description="Physics revision")
    db.add_all([math, science])
    db.commit()
    db.refresh(math)
    db.refresh(science)

    task_one = Task(
        title="Review derivatives",
        description="Practice 10 derivative questions",
        subject_id=math.id,
        priority="high",
        status="pending",
        due_date=date.today(),
        estimated_duration=90,
    )
    task_two = Task(
        title="Read optics notes",
        description="Summarize key formulas",
        subject_id=science.id,
        priority="medium",
        status="completed",
        due_date=date.today() + timedelta(days=2),
        estimated_duration=60,
    )
    db.add_all([task_one, task_two])
    db.commit()
    db.refresh(task_one)
    db.refresh(task_two)

    session = StudySession(
        task_id=task_one.id,
        session_date=date.today(),
        start_time="09:00",
        end_time="10:30",
        notes="Morning deep work",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    db.close()

    return {
        "subjects": [math, science],
        "tasks": [task_one, task_two],
        "sessions": [session],
    }
