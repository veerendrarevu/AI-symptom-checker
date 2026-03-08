
from fastapi import APIRouter, HTTPException
from app.database import db
from app.models.user import UserRegister, UserLogin
from app.utils.security import hash_password, verify_password, create_token

router = APIRouter()

@router.post("/register")
async def register(user: UserRegister):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(400, "Email already registered")

    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)

    await db.users.insert_one(user_dict)

    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(400, "Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(400, "Invalid credentials")

    token = create_token({"user_id": str(db_user["_id"])})

    return {"token": token}
