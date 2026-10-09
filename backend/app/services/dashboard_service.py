from datetime import date, timedelta

from sqlalchemy.orm import Session, joinedload

from app import models
from app.schemas import SubjectStudyTime


def _session_duration_minutes(start_time: str, end_time: str) -> int:
    start_hour, start_minute = map(int, start_time.split(":"))
    end_hour, end_minute = map(int, end_time.split(":"))
    return ((end_hour * 60) + end_minute) - ((start_hour * 60) + start_minute)


def get_dashboard_stats(db: Session):
    today = date.today()
    next_week = today + timedelta(days=7)

    today_tasks = (
        db.query(models.Task)
        .options(joinedload(models.Task.subject))
        .filter(models.Task.due_date == today)
        .order_by(models.Task.priority.desc(), models.Task.title.asc())
        .all()
    )
    today_sessions = (
        db.query(models.StudySession)
        .options(joinedload(models.StudySession.task).joinedload(models.Task.subject))
        .filter(models.StudySession.session_date == today)
        .order_by(models.StudySession.start_time.asc())
        .all()
    )
    upcoming_deadlines = (
        db.query(models.Task)
        .options(joinedload(models.Task.subject))
        .filter(
            models.Task.due_date.is_not(None),
            models.Task.due_date > today,
            models.Task.due_date <= next_week,
            models.Task.status != "completed",
        )
        .order_by(models.Task.due_date.asc())
        .limit(10)
        .all()
    )
    overdue_tasks = (
        db.query(models.Task)
        .options(joinedload(models.Task.subject))
        .filter(
            models.Task.due_date.is_not(None),
            models.Task.due_date < today,
            models.Task.status != "completed",
        )
        .order_by(models.Task.due_date.asc())
        .limit(10)
        .all()
    )

    completed_tasks = db.query(models.Task).filter(models.Task.status == "completed").count()
    pending_tasks = db.query(models.Task).filter(models.Task.status != "completed").count()
    total_tasks = completed_tasks + pending_tasks
    completion_percentage = round((completed_tasks / total_tasks) * 100, 2) if total_tasks else 0.0

    subject_lookup = {
        subject.id: SubjectStudyTime(
            subject_id=subject.id,
            subject_name=subject.name,
            color=subject.color,
            total_minutes=0,
        )
        for subject in db.query(models.Subject).all()
    }

    total_study_minutes = 0
    sessions = (
        db.query(models.StudySession)
        .options(joinedload(models.StudySession.task).joinedload(models.Task.subject))
        .all()
    )
    for session in sessions:
        duration = _session_duration_minutes(session.start_time, session.end_time)
        total_study_minutes += duration
        subject_lookup[session.task.subject.id].total_minutes += duration

    return {
        "today_tasks": today_tasks,
        "today_sessions": today_sessions,
        "upcoming_deadlines": upcoming_deadlines,
        "overdue_tasks": overdue_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "completion_percentage": completion_percentage,
        "total_study_minutes": total_study_minutes,
        "study_time_per_subject": list(subject_lookup.values()),
    }
