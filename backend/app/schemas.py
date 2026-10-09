from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


PriorityType = Literal["low", "medium", "high"]
StatusType = Literal["pending", "in-progress", "completed"]


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int


class SubjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    color: str = Field(..., min_length=4, max_length=20)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: str) -> str:
        if not value.startswith("#") or len(value) not in {4, 7}:
            raise ValueError("Color must be a valid hex code like #3b82f6.")
        return value


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    color: str | None = Field(default=None, min_length=4, max_length=20)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not value.startswith("#") or len(value) not in {4, 7}:
            raise ValueError("Color must be a valid hex code like #3b82f6.")
        return value


class SubjectRead(SubjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class SubjectSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    color: str


class TaskBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    subject_id: int
    priority: PriorityType = "medium"
    status: StatusType = "pending"
    due_date: date | None = None
    estimated_duration: int | None = Field(default=None, ge=1, le=1440)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    subject_id: int | None = None
    priority: PriorityType | None = None
    status: StatusType | None = None
    due_date: date | None = None
    estimated_duration: int | None = Field(default=None, ge=1, le=1440)


class TaskStatusUpdate(BaseModel):
    status: StatusType


class TaskRead(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    subject: SubjectSummary


class SessionBase(BaseModel):
    task_id: int
    session_date: date
    start_time: str
    end_time: str
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_time_string(cls, value: str) -> str:
        try:
            time.fromisoformat(value)
        except ValueError as exc:
            raise ValueError("Time must use HH:MM format.") from exc
        if len(value) != 5:
            raise ValueError("Time must use HH:MM format.")
        return value

    @model_validator(mode="after")
    def validate_range(self):
        if time.fromisoformat(self.end_time) <= time.fromisoformat(self.start_time):
            raise ValueError("End time must be later than start time.")
        return self


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    task_id: int | None = None
    session_date: date | None = None
    start_time: str | None = None
    end_time: str | None = None
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_optional_time_string(cls, value: str | None) -> str | None:
        if value is None:
            return value
        try:
            time.fromisoformat(value)
        except ValueError as exc:
            raise ValueError("Time must use HH:MM format.") from exc
        if len(value) != 5:
            raise ValueError("Time must use HH:MM format.")
        return value


class SessionTaskSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    subject: SubjectSummary
    priority: PriorityType
    status: StatusType


class SessionRead(SessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    task: SessionTaskSummary


class SubjectListResponse(BaseModel):
    items: list[SubjectRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class TaskListResponse(BaseModel):
    items: list[TaskRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class SessionListResponse(BaseModel):
    items: list[SessionRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class SubjectStudyTime(BaseModel):
    subject_id: int
    subject_name: str
    color: str
    total_minutes: int


class DashboardStats(BaseModel):
    today_tasks: list[TaskRead]
    today_sessions: list[SessionRead]
    upcoming_deadlines: list[TaskRead]
    overdue_tasks: list[TaskRead]
    completed_tasks: int
    pending_tasks: int
    completion_percentage: float
    total_study_minutes: int
    study_time_per_subject: list[SubjectStudyTime]
