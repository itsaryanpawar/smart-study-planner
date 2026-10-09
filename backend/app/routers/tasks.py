from datetime import date

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.services.common import paginate
from app.services.task_service import (
    create_task,
    delete_task,
    get_task_or_404,
    list_tasks,
    update_task,
    update_task_status,
)


router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=schemas.TaskListResponse)
def get_tasks(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    subject_id: int | None = None,
    status_value: str | None = Query(default=None, alias="status"),
    priority: str | None = None,
    due_from: date | None = None,
    due_to: date | None = None,
    search: str | None = None,
    sort_by: str = Query(default="due_date", pattern="^(due_date|priority)$"),
    sort_order: str = Query(default="asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    query = list_tasks(
        db,
        page=page,
        page_size=page_size,
        subject_id=subject_id,
        status_value=status_value,
        priority=priority,
        due_from=due_from,
        due_to=due_to,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return paginate(query, page, page_size)


@router.post("", response_model=schemas.TaskRead, status_code=status.HTTP_201_CREATED)
def create_task_endpoint(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    return create_task(db, payload)


@router.get("/{task_id}", response_model=schemas.TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return get_task_or_404(db, task_id)


@router.put("/{task_id}", response_model=schemas.TaskRead)
def update_task_endpoint(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    return update_task(db, task_id, payload)


@router.patch("/{task_id}/status", response_model=schemas.TaskRead)
def update_task_status_endpoint(
    task_id: int,
    payload: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
):
    return update_task_status(db, task_id, payload)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    delete_task(db, task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
