from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.seed import ensure_default_access_codes
from app.routers import (
    admin,
    auth,
    auth_json,
    calendar_json,
    chat,
    documents_json,
    feedback_json,
    knowledge_json,
    reminders_json,
    search_json,
    task_templates,
    tasks_json,
    team,
)

# Optional database-backed routers (used when JSON storage disabled)
from app.routers import calendar, documents, knowledge, reminders, search, tasks

settings = get_settings()

# Initialize database tables and default access codes
try:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        ensure_default_access_codes(session)
except Exception as e:
    print(f"Warning: Database initialization failed: {e}")
    if not settings.use_json_storage:
        print("ERROR: Database is required when JSON storage is disabled")
        raise
    print("Continuing with JSON storage mode...")

app = FastAPI(
    title="Task Planner API",
    description="A comprehensive task planning, calendar, and knowledge management system",
    version="1.0.0"
)

# Configure CORS
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication first (use JSON-based auth when using JSON storage)
if settings.use_json_storage:
    app.include_router(auth_json.router)
else:
    app.include_router(auth.router)

if settings.use_json_storage:
    app.include_router(tasks_json.router)
    app.include_router(calendar_json.router)
    app.include_router(reminders_json.router)
    app.include_router(knowledge_json.router)
    app.include_router(documents_json.router)
    app.include_router(search_json.router)
    app.include_router(team.router)
    app.include_router(feedback_json.router)
else:
    app.include_router(tasks.router)
    app.include_router(calendar.router)
    app.include_router(reminders.router)
    app.include_router(knowledge.router)
    app.include_router(documents.router)
    app.include_router(search.router)
    app.include_router(feedback_json.router)

app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(task_templates.router)


@app.get("/")
def read_root():
    return {
        "message": "Task Planner API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
