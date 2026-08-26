from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

from infrastructure.api.config import settings

api_key_header = APIKeyHeader(name="X-API-Key")

def verify_api_key(api_key: str = Depends(api_key_header)) -> None:
    if api_key != settings.api_key:
        raise HTTPException(
            status_code=401,
            detail="API key invalida"
        )