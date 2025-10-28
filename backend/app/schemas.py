from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional
from app.models import Priority, TaskStatus, AccessRole


# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: Priority = Priority.MEDIUM
    due_date: Optional[datetime] = None
    assignee: Optional[str] = None
    time_to_complete_minutes: int = Field(..., ge=1)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    assignee: Optional[str] = None
    time_to_complete_minutes: Optional[int] = Field(default=None, ge=1)


class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Calendar Event Schemas
class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    all_day: bool = False


class CalendarEventCreate(CalendarEventBase):
    pass


class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    all_day: Optional[bool] = None


class CalendarEvent(CalendarEventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Reminder Schemas
class ReminderBase(BaseModel):
    title: str
    description: Optional[str] = None
    remind_at: datetime
    is_active: bool = True


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    remind_at: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_completed: Optional[bool] = None


class Reminder(ReminderBase):
    id: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Knowledge Base Schemas
class KnowledgeBaseBase(BaseModel):
    title: str
    content: str
    category: Optional[str] = None
    tags: Optional[str] = None


class KnowledgeBaseCreate(KnowledgeBaseBase):
    pass


class KnowledgeBaseUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None


class KnowledgeBase(KnowledgeBaseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Document Schemas
class DocumentBase(BaseModel):
    title: str
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    tags: Optional[str] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    tags: Optional[str] = None


class Document(DocumentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Chat Schemas
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    created_at: datetime


# Search Schema
class SearchQuery(BaseModel):
    query: str
    categories: Optional[list[str]] = None


# Authentication Schemas
class LoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    label: str
    role: AccessRole
    expires_at: datetime


class SessionInfo(BaseModel):
    label: Optional[str] = None
    role: Optional[AccessRole] = None
    expires_at: Optional[datetime] = None
    authenticated: bool = False


class LoginAttempt(BaseModel):
    id: int
    submitted_code: str
    code_label: Optional[str] = None
    code_role: Optional[AccessRole] = None
    success: bool
    failure_reason: Optional[str] = None
    client_ip: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AccessCodeInfo(BaseModel):
    label: str
    role: AccessRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Feedback Schemas
class FeedbackBase(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    email: Optional[EmailStr] = None
    category: str = Field(..., min_length=3, max_length=50)
    message: str = Field(..., min_length=10, max_length=1000)


class FeedbackCreate(FeedbackBase):
    pass


class Feedback(FeedbackBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
