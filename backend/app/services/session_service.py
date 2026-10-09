from datetime import date, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app import models
from app.schemas import SessionCreate, SessionUpdate


def get_session_or_404(db: Session, session_id: int):
    session = (
        db.query(models.StudySession)
        .options(
            joinedload(models.StudySession.task)
            .joinedload(models.Task.subject)
        )
        .filter(models.StudySession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} was not found.",
        )
    return session


def ensure_task_exists(db: Session, task_id: int):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} was not found.",
        )
    return task


def _to_datetime(session_date: date, value: str) -> datetime:
    return datetime.combine(session_date, datetime.strptime(value, "%H:%M").time())


def validate_no_overlap(
    db: Session,
    *,
    task_id: int,
    session_date: date,
    start_time: str,
    end_time: str,
    exclude_session_id: int | None = None,
):
    ensure_task_exists(db, task_id)
    new_start = _to_datetime(session_date, start_time)
    new_end = _to_datetime(session_date, end_time)

    query = db.query(models.StudySession).filter(models.StudySession.session_date == session_date)
    if exclude_session_id is not None:
        query = query.filter(models.StudySession.id != exclude_session_id)

    for existing in query.all():
        existing_start = _to_datetime(existing.session_date, existing.start_time)
        existing_end = _to_datetime(existing.session_date, existing.end_time)
        if new_start < existing_end and new_end > existing_start:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This session overlaps with an existing study session "
                    f"from {existing.start_time} to {existing.end_time}."
                ),
            )


def create_session(db: Session, payload: SessionCreate):
    validate_no_overlap(
        db,
        task_id=payload.task_id,
        session_date=payload.session_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )
    session = models.StudySession(**payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return get_session_or_404(db, session.id)


def update_session(db: Session, session_id: int, payload: SessionUpdate):
    session = get_session_or_404(db, session_id)
    update_data = payload.model_dump(exclude_unset=True)

    merged = {
        "task_id": update_data.get("task_id", session.task_id),
        "session_date": update_data.get("session_date", session.session_date),
        "start_time": update_data.get("start_time", session.start_time),
        "end_time": update_data.get("end_time", session.end_time),
    }
    if merged["end_time"] <= merged["start_time"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="End time must be later than start time.",
        )

    validate_no_overlap(db, exclude_session_id=session_id, **merged)

    for field, value in update_data.items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)
    return get_session_or_404(db, session_id)


def list_sessions(
    db: Session,
    *,
    page: int,
    page_size: int,
    session_date: date | None = None,
    view: str = "day",
):
    query = db.query(models.StudySession).options(
        joinedload(models.StudySession.task).joinedload(models.Task.subject)
    )

    if session_date:
        if view == "week":
            week_start = session_date - timedelta(days=session_date.weekday())
            week_end = week_start + timedelta(days=6)
            query = query.filter(models.StudySession.session_date.between(week_start, week_end))
        else:
            query = query.filter(models.StudySession.session_date == session_date)

    return query.order_by(models.StudySession.session_date.asc(), models.StudySession.start_time.asc())


def delete_session(db: Session, session_id: int):
    session = db.query(models.StudySession).filter(models.StudySession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} was not found.",
        )
    db.delete(session)
    db.commit()
