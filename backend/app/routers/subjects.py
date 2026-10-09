from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.services.common import paginate


router = APIRouter(prefix="/api/subjects", tags=["Subjects"])


@router.get("", response_model=schemas.SubjectListResponse)
def list_subjects(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Subject).order_by(models.Subject.name.asc())
    return paginate(query, page, page_size)


@router.post("", response_model=schemas.SubjectRead, status_code=status.HTTP_201_CREATED)
def create_subject(payload: schemas.SubjectCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Subject).filter(models.Subject.name.ilike(payload.name.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A subject with this name already exists.",
        )
    subject = models.Subject(**payload.model_dump(), name=payload.name.strip())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/{subject_id}", response_model=schemas.SubjectRead)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with id {subject_id} was not found.",
        )
    return subject


@router.put("/{subject_id}", response_model=schemas.SubjectRead)
def update_subject(subject_id: int, payload: schemas.SubjectUpdate, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with id {subject_id} was not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data:
        duplicate = (
            db.query(models.Subject)
            .filter(models.Subject.id != subject_id, models.Subject.name.ilike(update_data["name"].strip()))
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A subject with this name already exists.",
            )
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        setattr(subject, field, value)

    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with id {subject_id} was not found.",
        )
    db.delete(subject)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
