from fastapi import Header, HTTPException, status
from app.config import AI_SERVICE_SECRET

async def verify_service_secret(x_ai_service_secret: str = Header(None)):
    if not x_ai_service_secret or x_ai_service_secret != AI_SERVICE_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized AI Service Request. Invalid Secret Key."
        )
    return True
