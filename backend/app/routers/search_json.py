from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Any
from app import schemas
from app.services.json_storage import json_storage
from app.services.claude_service import search_with_claude
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/search",
    tags=["search"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.post("/")
async def search(search_query: schemas.SearchQuery):
    """
    Global search across all data types in JSON files
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
        all_tasks = json_storage.get_all("tasks")
        tasks = [
            t for t in all_tasks
            if query in t.get('title', '').lower() or query in t.get('description', '').lower()
        ][:10]
        results["tasks"] = [
            {
                "id": t.get('id'),
                "title": t.get('title'),
                "description": t.get('description'),
                "status": t.get('status'),
                "priority": t.get('priority')
            }
            for t in tasks
        ]

    # Search calendar events
    if "events" in categories:
        all_events = json_storage.get_all("calendar")
        events = [
            e for e in all_events
            if query in e.get('title', '').lower() or query in e.get('description', '').lower()
        ][:10]
        results["events"] = [
            {
                "id": e.get('id'),
                "title": e.get('title'),
                "description": e.get('description'),
                "start_time": e.get('start_time'),
                "end_time": e.get('end_time')
            }
            for e in events
        ]

    # Search reminders
    if "reminders" in categories:
        all_reminders = json_storage.get_all("reminders")
        reminders = [
            r for r in all_reminders
            if query in r.get('title', '').lower() or query in r.get('description', '').lower()
        ][:10]
        results["reminders"] = [
            {
                "id": r.get('id'),
                "title": r.get('title'),
                "description": r.get('description'),
                "remind_at": r.get('remind_at')
            }
            for r in reminders
        ]

    # Search knowledge base
    if "knowledge" in categories:
        all_knowledge = json_storage.get_all("knowledge")
        knowledge = [
            k for k in all_knowledge
            if query in k.get('title', '').lower() or query in k.get('content', '').lower()
        ][:10]
        results["knowledge"] = [
            {
                "id": k.get('id'),
                "title": k.get('title'),
                "content": k.get('content', '')[:200] + "..." if len(k.get('content', '')) > 200 else k.get('content', ''),
                "category": k.get('category')
            }
            for k in knowledge
        ]

    # Search documents
    if "documents" in categories:
        all_documents = json_storage.get_all("documents")
        documents = [
            d for d in all_documents
            if query in d.get('title', '').lower() or query in d.get('description', '').lower()
        ][:10]
        results["documents"] = [
            {
                "id": d.get('id'),
                "title": d.get('title'),
                "description": d.get('description'),
                "file_type": d.get('file_type'),
                "url": d.get('url')
            }
            for d in documents
        ]

    return {
        "query": search_query.query,
        "results": results,
        "total_results": sum(len(v) for v in results.values())
    }


@router.post("/ai")
async def ai_search(search_query: schemas.SearchQuery):
    """
    AI-powered search using Claude to analyze and return relevant results from JSON files
    """
    # Gather all data as context from JSON files
    tasks = json_storage.get_all("tasks")[:50]
    events = json_storage.get_all("calendar")[:50]
    knowledge = json_storage.get_all("knowledge")[:50]
    documents = json_storage.get_all("documents")[:50]

    # Build context for Claude
    context = f"""
Tasks:
{chr(10).join([f"- {t.get('title')}: {t.get('description', 'No description')}" for t in tasks])}

Calendar Events:
{chr(10).join([f"- {e.get('title')}: {e.get('description', 'No description')}" for e in events])}

Knowledge Base:
{chr(10).join([f"- {k.get('title')}: {k.get('content', '')[:100]}..." for k in knowledge])}

Documents:
{chr(10).join([f"- {d.get('title')}: {d.get('description', 'No description')}" for d in documents])}
"""

    try:
        ai_response = await search_with_claude(search_query.query, context)
        return {
            "query": search_query.query,
            "ai_analysis": ai_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
