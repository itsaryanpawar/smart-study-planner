from datetime import date

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.services.common import paginate
from app.services.session_service import (
    create_session,
    delete_session,
    get_session_or_404,
    list_sessions,
    update_session,
)


router = APIRouter(prefix="/api/sessions", tags=["Sessions"])


@router.get("", response_model=schemas.SessionListResponse)
def get_sessions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    date_value: date | None = Query(default=None, alias="date"),
    view: str = Query(default="day", pattern="^(day|week)$"),
    db: Session = Depends(get_db),
):
    query = list_sessions(db, page=page, page_size=page_size, session_date=date_value, view=view)
    return paginate(query, page, page_size)


@router.post("", response_model=schemas.SessionRead, status_code=status.HTTP_201_CREATED)
def create_session_endpoint(payload: schemas.SessionCreate, db: Session = Depends(get_db)):
    return create_session(db, payload)


@router.get("/{session_id}", response_model=schemas.SessionRead)
def get_session(session_id: int, db: Session = Depends(get_db)):
    return get_session_or_404(db, session_id)


@router.put("/{session_id}", response_model=schemas.SessionRead)
def update_session_endpoint(
    session_id: int,
    payload: schemas.SessionUpdate,
    db: Session = Depends(get_db),
):
    return update_session(db, session_id, payload)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session_endpoint(session_id: int, db: Session = Depends(get_db)):
    delete_session(db, session_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
