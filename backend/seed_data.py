from datetime import date, timedelta

from app.database import Base, SessionLocal, engine
from app.models import StudySession, Subject, Task


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Subject).count() > 0:
        print("Seed skipped: database already contains data.")
        db.close()
        return

    subjects = [
        Subject(name="Mathematics", color="#2563eb", description="Calculus, algebra, and problem solving"),
        Subject(name="Physics", color="#10b981", description="Mechanics and waves"),
        Subject(name="Literature", color="#f97316", description="Essay preparation and reading notes"),
    ]
    db.add_all(subjects)
    db.commit()
    for subject in subjects:
        db.refresh(subject)

    tasks = [
        Task(
            title="Complete calculus worksheet",
            description="Solve limits and differentiation questions",
            subject_id=subjects[0].id,
            priority="high",
            status="pending",
            due_date=date.today() + timedelta(days=1),
            estimated_duration=120,
        ),
        Task(
            title="Summarize wave formulas",
            description="Create a one-page revision sheet",
            subject_id=subjects[1].id,
            priority="medium",
            status="in-progress",
            due_date=date.today() + timedelta(days=3),
            estimated_duration=60,
        ),
        Task(
            title="Read chapter 5",
            description="Highlight the main themes and quotes",
            subject_id=subjects[2].id,
            priority="low",
            status="completed",
            due_date=date.today() - timedelta(days=1),
            estimated_duration=45,
        ),
    ]
    db.add_all(tasks)
    db.commit()
    for task in tasks:
        db.refresh(task)

    sessions = [
        StudySession(
            task_id=tasks[0].id,
            session_date=date.today(),
            start_time="08:00",
            end_time="09:30",
            notes="Morning focus block",
        ),
        StudySession(
            task_id=tasks[1].id,
            session_date=date.today(),
            start_time="17:00",
            end_time="18:00",
            notes="Evening review",
        ),
    ]
    db.add_all(sessions)
    db.commit()
    db.close()
    print("Seed data inserted successfully.")


if __name__ == "__main__":
    seed()
