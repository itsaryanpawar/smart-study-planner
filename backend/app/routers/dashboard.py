from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import DashboardStats
from app.services.dashboard_service import get_dashboard_stats


router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)
