from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

from infrastructure.api.config import settings

api_key_header = APIKeyHeader(name="X-API-Key")

def verify_api_key(api_key: str = Depends(api_key_header)) -> None:
    """
    FastAPI dependency that validates the X-API-Key header against the
    configured API key, raising 401 if it doesn't match.
    """
    if api_key != settings.api_key:
        raise HTTPException(
            status_code=401,
            detail="API key invalida"
        )