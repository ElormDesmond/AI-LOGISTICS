import json
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.database.connection import SessionLocal
from app.database import crud
from app.security.jwt_handler import decode_token

logger = logging.getLogger(__name__)

# Sensitive keywords to redact from audit logs
SENSITIVE_FIELDS = {"password", "secret", "token", "authorization", "api_key", "password_hash"}

def _sanitize_dict(data: dict) -> dict:
    """Recursively redacts sensitive credential fields from logged payloads."""
    sanitized = {}
    for key, value in data.items():
        if any(sensitive in key.lower() for sensitive in SENSITIVE_FIELDS):
            sanitized[key] = "[REDACTED]"
        elif isinstance(value, dict):
            sanitized[key] = _sanitize_dict(value)
        else:
            sanitized[key] = value
    return sanitized

class ComplianceAuditMiddleware(BaseHTTPMiddleware):
    """
    Middleware intercepting all state-changing API operations (POST, PUT, DELETE)
    and writing an immutable compliance audit record for regulatory compliance.
    """

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Only audit state-changing write operations
        if request.method in ["POST", "PUT", "DELETE"]:
            user_id = None
            company_id = 1
            
            # Extract user claims from Authorization header if present
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                try:
                    token = auth_header.split(" ")[1]
                    payload = decode_token(token)
                    user_id = payload.get("user_id")
                    company_id = payload.get("company_id", 1)
                except Exception:
                    pass

            ip_address = request.client.host if request.client else "unknown"

            db = SessionLocal()
            try:
                crud.create_audit_log(
                    db=db,
                    user_id=user_id,
                    company_id=company_id,
                    action=f"HTTP_{request.method}_{request.url.path}",
                    resource_type="api_endpoint",
                    resource_id=None,
                    change_data={
                        "path": request.url.path,
                        "method": request.method,
                        "status_code": response.status_code
                    },
                    ip_address=ip_address
                )
            except Exception as e:
                logger.error(f"Audit log middleware failed to write log: {str(e)}")
            finally:
                db.close()

        return response
