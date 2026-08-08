from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import crud
from app.database.models import User
from app.models.user import UserCreate, UserRead, Token
from app.security.password import hash_password, verify_password
from app.security.jwt_handler import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user account with bcrypt password hashing.
    Enforces email uniqueness and input validation.
    """
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )
    
    hashed_pwd = hash_password(user_in.password)
    db_user = User(
        email=user_in.email,
        password_hash=hashed_pwd,
        company_id=user_in.company_id,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    crud.create_audit_log(
        db=db,
        user_id=db_user.id,
        company_id=db_user.company_id,
        action="USER_REGISTERED",
        resource_type="user",
        resource_id=db_user.id
    )
    
    return db_user

@router.post("/login", response_model=Token)
def login_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Authenticates a user and issues a JWT token.
    Uses constant-time password verification against timing attacks.
    """
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if not db_user or not verify_password(user_in.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = create_access_token(
        user_id=db_user.id,
        company_id=db_user.company_id,
        role=db_user.role
    )
    
    crud.create_audit_log(
        db=db,
        user_id=db_user.id,
        company_id=db_user.company_id,
        action="USER_LOGIN_SUCCESS",
        resource_type="user",
        resource_id=db_user.id
    )
    
    return Token(access_token=token, token_type="bearer")

@router.get("/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns current authenticated user profile details."""
    db_user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not db_user:
        return current_user
    return {
        "id": db_user.id,
        "email": db_user.email,
        "company_id": db_user.company_id,
        "role": db_user.role,
        "created_at": db_user.created_at
    }
