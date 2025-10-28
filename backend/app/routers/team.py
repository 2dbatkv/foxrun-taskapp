from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.services.json_storage import json_storage
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/team",
    tags=["team"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/")
async def get_team() -> Dict[str, List[Any]]:
    """
    Get all team members with their daily capacity
    """
    team_members = json_storage.get_all("team")
    return {"team": team_members}
