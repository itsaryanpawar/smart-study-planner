from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import case
from sqlalchemy.orm import Session, joinedload

from app import models
from app.schemas import TaskCreate, TaskStatusUpdate, TaskUpdate
from app.services.common import PRIORITY_ORDER


def ensure_subject_exists(db: Session, subject_id: int):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with id {subject_id} was not found.",
        )
    return subject


def get_task_or_404(db: Session, task_id: int):
    task = (
        db.query(models.Task)
        .options(joinedload(models.Task.subject))
        .filter(models.Task.id == task_id)
        .first()
    )
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} was not found.",
        )
    return task


def list_tasks(
    db: Session,
    *,
    page: int,
    page_size: int,
    subject_id: int | None = None,
    status_value: str | None = None,
    priority: str | None = None,
    due_from: date | None = None,
    due_to: date | None = None,
    search: str | None = None,
    sort_by: str = "due_date",
    sort_order: str = "asc",
):
    query = db.query(models.Task).options(joinedload(models.Task.subject))

    if subject_id is not None:
        query = query.filter(models.Task.subject_id == subject_id)
    if status_value:
        query = query.filter(models.Task.status == status_value)
    if priority:
        query = query.filter(models.Task.priority == priority)
    if due_from:
        query = query.filter(models.Task.due_date >= due_from)
    if due_to:
        query = query.filter(models.Task.due_date <= due_to)
    if search:
        query = query.filter(models.Task.title.ilike(f"%{search.strip()}%"))

    if sort_by == "priority":
        priority_case = case(
            *[(models.Task.priority == key, value) for key, value in PRIORITY_ORDER.items()],
            else_=0,
        )
        query = query.order_by(priority_case.desc() if sort_order == "desc" else priority_case.asc())
    else:
        due_date_column = models.Task.due_date
        query = query.order_by(
            due_date_column.desc().nullslast() if sort_order == "desc" else due_date_column.asc().nullslast()
        )

    return query


def create_task(db: Session, payload: TaskCreate):
    ensure_subject_exists(db, payload.subject_id)
    task = models.Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return get_task_or_404(db, task.id)


def update_task(db: Session, task_id: int, payload: TaskUpdate):
    task = get_task_or_404(db, task_id)
    update_data = payload.model_dump(exclude_unset=True)
    if "subject_id" in update_data and update_data["subject_id"] is not None:
        ensure_subject_exists(db, update_data["subject_id"])

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return get_task_or_404(db, task_id)


def update_task_status(db: Session, task_id: int, payload: TaskStatusUpdate):
    task = get_task_or_404(db, task_id)
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return get_task_or_404(db, task_id)


def delete_task(db: Session, task_id: int):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} was not found.",
        )
    db.delete(task)
    db.commit()
