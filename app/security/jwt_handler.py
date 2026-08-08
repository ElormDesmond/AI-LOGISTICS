from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.config import settings
from app.database.connection import get_db
from app.database.models import User

security_scheme = HTTPBearer(auto_error=False)

def create_access_token(user_id: int, company_id: int, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a secure JWT access token.
    
    Claims included:
    - sub: user_id
    - company_id: multi-tenant company ID
    - role: user role (admin, operator, viewer)
    - exp: expiration timestamp
    """
    delta = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + delta
    
    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "company_id": company_id,
        "role": role,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies a JWT token.
    Raises HTTPException(401) if invalid or expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )

def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    FastAPI dependency enforcing authentication on protected routes.
    In development/debug mode without a token, provides a fallback operator user.
    """
    if not auth:
        if settings.DEBUG:
            # Fallback mock user for initial dev/testing without credentials
            return {"user_id": 1, "company_id": 1, "role": "operator", "email": "operator@coldchain.com"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = decode_token(auth.credentials)
    user_id = payload.get("user_id")
    company_id = payload.get("company_id")
    role = payload.get("role")
    
    if not user_id or not company_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token claims"
        )
    
    return {
        "user_id": int(user_id),
        "company_id": int(company_id),
        "role": role or "operator"
    }
