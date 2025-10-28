from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from app import models, schemas
from app.database import get_db
from app.services.claude_service import search_with_claude
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/search",
    tags=["search"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.post("/")
async def search(search_query: schemas.SearchQuery, db: Session = Depends(get_db)):
    """
    Global search across all data types using Claude AI
    """
    results: Dict[str, List[Any]] = {
        "tasks": [],
        "events": [],
        "reminders": [],
        "knowledge": [],
        "documents": []
    }

    query = search_query.query.lower()
    categories = search_query.categories or ["tasks", "events", "reminders", "knowledge", "documents"]

    # Search tasks
    if "tasks" in categories:
        tasks = db.query(models.Task).filter(
            (models.Task.title.ilike(f"%{query}%")) |
            (models.Task.description.ilike(f"%{query}%"))
        ).limit(10).all()
        results["tasks"] = [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "status": t.status.value,
                "priority": t.priority.value
            }
            for t in tasks
        ]

    # Search calendar events
    if "events" in categories:
        events = db.query(models.CalendarEvent).filter(
            (models.CalendarEvent.title.ilike(f"%{query}%")) |
            (models.CalendarEvent.description.ilike(f"%{query}%"))
        ).limit(10).all()
        results["events"] = [
            {
                "id": e.id,
                "title": e.title,
                "description": e.description,
                "start_time": e.start_time.isoformat(),
                "end_time": e.end_time.isoformat()
            }
            for e in events
        ]

    # Search reminders
    if "reminders" in categories:
        reminders = db.query(models.Reminder).filter(
            (models.Reminder.title.ilike(f"%{query}%")) |
            (models.Reminder.description.ilike(f"%{query}%"))
        ).limit(10).all()
        results["reminders"] = [
            {
                "id": r.id,
                "title": r.title,
                "description": r.description,
                "remind_at": r.remind_at.isoformat()
            }
            for r in reminders
        ]

    # Search knowledge base
    if "knowledge" in categories:
        knowledge = db.query(models.KnowledgeBase).filter(
            (models.KnowledgeBase.title.ilike(f"%{query}%")) |
            (models.KnowledgeBase.content.ilike(f"%{query}%"))
        ).limit(10).all()
        results["knowledge"] = [
            {
                "id": k.id,
                "title": k.title,
                "content": k.content[:200] + "..." if len(k.content) > 200 else k.content,
                "category": k.category
            }
            for k in knowledge
        ]

    # Search documents
    if "documents" in categories:
        documents = db.query(models.Document).filter(
            (models.Document.title.ilike(f"%{query}%")) |
            (models.Document.description.ilike(f"%{query}%"))
        ).limit(10).all()
        results["documents"] = [
            {
                "id": d.id,
                "title": d.title,
                "description": d.description,
                "file_type": d.file_type,
                "url": d.url
            }
            for d in documents
        ]

    return {
        "query": search_query.query,
        "results": results,
        "total_results": sum(len(v) for v in results.values())
    }


@router.post("/ai")
async def ai_search(search_query: schemas.SearchQuery, db: Session = Depends(get_db)):
    """
    AI-powered search using Claude to analyze and return relevant results
    """
    # Gather all data as context
    tasks = db.query(models.Task).limit(50).all()
    events = db.query(models.CalendarEvent).limit(50).all()
    knowledge = db.query(models.KnowledgeBase).limit(50).all()
    documents = db.query(models.Document).limit(50).all()

    # Build context for Claude
    context = f"""
Tasks:
{chr(10).join([f"- {t.title}: {t.description or 'No description'}" for t in tasks])}

Calendar Events:
{chr(10).join([f"- {e.title}: {e.description or 'No description'}" for e in events])}

Knowledge Base:
{chr(10).join([f"- {k.title}: {k.content[:100]}..." for k in knowledge])}

Documents:
{chr(10).join([f"- {d.title}: {d.description or 'No description'}" for d in documents])}
"""

    try:
        ai_response = await search_with_claude(search_query.query, context)
        return {
            "query": search_query.query,
            "ai_analysis": ai_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
