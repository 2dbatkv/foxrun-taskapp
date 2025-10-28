from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.services.claude_service import chat_with_claude
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.post("/", response_model=schemas.ChatResponse)
async def send_message(chat_request: schemas.ChatRequest, db: Session = Depends(get_db)):
    """Send a message to Claude and get a response"""
    try:
        # Save user message to history
        user_message = models.ChatHistory(
            role="user",
            content=chat_request.message
        )
        db.add(user_message)
        db.commit()

        # Get response from Claude
        response_text = await chat_with_claude(
            message=chat_request.message,
            context=chat_request.context
        )

        # Save assistant response to history
        assistant_message = models.ChatHistory(
            role="assistant",
            content=response_text
        )
        db.add(assistant_message)
        db.commit()

        return schemas.ChatResponse(
            response=response_text,
            created_at=assistant_message.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=List[schemas.ChatMessage])
def get_chat_history(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Get chat history"""
    history = db.query(models.ChatHistory).order_by(
        models.ChatHistory.created_at.desc()
    ).offset(skip).limit(limit).all()

    return [
        schemas.ChatMessage(role=msg.role, content=msg.content)
        for msg in reversed(history)
    ]


@router.delete("/history", status_code=204)
def clear_chat_history(db: Session = Depends(get_db)):
    """Clear all chat history"""
    db.query(models.ChatHistory).delete()
    db.commit()
    return None
