from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import timedelta, datetime
from schemas.user_schemas import UserCreate, UserUpdate, UserOut, UserBase
from db.database import get_session
from dal_files.user_dal import UserDAL
from utils import verify_password, create_access_token, generate_passwd_hash
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dependencies import get_current_user
from dal_files.class_dal import ClassDAL

user_router = APIRouter()
user_service = UserDAL()
class_service = ClassDAL()

class SendOtpRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp_code: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    email: str
    otp_code: str
    new_password: str

class UserLogin(BaseModel):
    email: str
    password: str
    remember_me: bool = False

@user_router.get("/me", response_model=UserOut)
async def get_current_user(current_user: UserBase = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    user_id = current_user.uid
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated")
    user = await user_service.get_user_by_id(user_id, session)
    return user

@user_router.get("/all-users", response_model=list[UserOut])
async def get_all_users(session: AsyncSession = Depends(get_session)):
    users = await user_service.get_all_users(session)
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users

@user_router.post("/google")
async def google_login(google_data: dict, session: AsyncSession = Depends(get_session)):
    """
    Handles Google sign up/login. Expects {id_token, class_id} from frontend.
    Extracts user info from Google token using user_service.verify_google_token.
    """
    user_info = await user_service.verify_google_token(google_data["id_token"])
    class_id = google_data["class_id"]
    class_ = await class_service.get_class_by_id(class_id, session)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    if not user_info:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

    # Extract info from token (already handled in user_dal)
    google_id = user_info.get("sub")
    email = user_info.get("email")
    first_name = user_info.get("first_name", "")
    last_name = user_info.get("last_name", "")

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not found in Google token")

    # Fallbacks for missing names
    if not first_name.strip():
        first_name = email.split("@")[0] if email else "User"
    if not last_name.strip():
        last_name = ""

    user = await user_service.get_user_by_email(email, session)
    if user is None:
        user_create = UserCreate(
            email=email,
            first_name=first_name,
            last_name=last_name,
            google_id=google_id,
            class_id=class_id
        )
        user = await user_service.create_user(user_create, session)
    user_data = {
        "email": user.email,
        "user_uid": str(user.uid),
        "first_name": user.first_name,
        "last_name": user.last_name,
    }
    access_token = create_access_token(user_data=user_data)
    refresh_token = create_access_token(user_data=user_data, refresh=True, expiry=timedelta(days=2))
    return JSONResponse(content={
        "message": "Google login successful",
        "token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "email": user.email,
            "uid": str(user.uid),
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    })

@user_router.post("/sign-up", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, session: AsyncSession = Depends(get_session)):
    email = user.email
    existing_user = await user_service.get_user_by_email(email, session)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    created_user = await user_service.create_user(user, session)
    if not created_user:
        raise HTTPException(status_code=400, detail="User creation failed")
    access_token = create_access_token(user_data={
        "email": created_user.email,
        "user_id": str(created_user.uid)
    })
    otp_code = user_service.generate_otp()
    await user_service.save_otp(created_user.email, otp_code, expiry_minutes=10, db_session=session)
    await user_service.send_otp_via_email(created_user.email, otp_code)
    return {
        "message": "User created successfully. OTP sent to email.",
        "user": {
            "user_id": created_user.uid,
            "email": created_user.email,
            "first_name": created_user.first_name,
            "last_name": created_user.last_name
        },
        "token": access_token
    }

@user_router.get("/{user_id}", response_model=UserOut)
async def get_user_by_id(user_id: str, session: AsyncSession = Depends(get_session)):
    user = await user_service.get_user_by_id(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@user_router.put("/", response_model=UserOut)
async def update_user(user_update: UserUpdate, current_user: UserBase = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    user_id = current_user.uid
    updated_user = await user_service.update_user(user_id, user_update, session)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@user_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, session: AsyncSession = Depends(get_session)):
    success = await user_service.delete_user(user_id, session)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@user_router.post("/send-otp")
async def send_otp(request: SendOtpRequest, session: AsyncSession = Depends(get_session)):
    user = await user_service.get_user_by_email(request.email, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    otp_code = user_service.generate_otp()
    await user_service.save_otp(request.email, otp_code, expiry_minutes=10, db_session=session)
    await user_service.send_otp_via_email(request.email, otp_code)
    return {"message": "OTP sent to email"}

@user_router.post("/verify-otp")
async def verify_otp(request: VerifyOtpRequest, session: AsyncSession = Depends(get_session)):
    user = await user_service.verify_otp(request.email, request.otp_code, session)
    return {"message": "User verified successfully", "is_verified": user.is_verified}

@user_router.post("/password-reset/request")
async def request_password_reset(request: PasswordResetRequest, session: AsyncSession = Depends(get_session)):
    user = await user_service.get_user_by_email(request.email, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    otp_code = user_service.generate_otp()
    await user_service.save_otp(request.email, otp_code, expiry_minutes=10, db_session=session)
    await user_service.send_otp_via_email(request.email, otp_code)
    return {"message": "Password reset OTP sent to email"}

@user_router.post("/password-reset/confirm")
async def confirm_password_reset(data: PasswordResetConfirm, session: AsyncSession = Depends(get_session)):
    user = await user_service.get_user_by_email(data.email, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.otp_code != data.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    if user.otp_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")
    user.password_hash = generate_passwd_hash(data.new_password)
    user.otp_code = None
    user.otp_expiry = None
    await session.commit()
    await session.refresh(user)
    return {"message": "Password reset successful"}

@user_router.post("/login")
async def login_users(login_data: UserLogin, session: AsyncSession = Depends(get_session)):
    email = login_data.email
    password = login_data.password
    user = await user_service.get_user_by_email(email, session)
    if user is not None:
        password_valid = verify_password(password, user.password_hash)
        if password_valid:
            access_token = create_access_token(
                user_data={
                    "email": user.email,
                    "user_id": str(user.uid),
                    "role_id": str(getattr(user, 'role_id', '')) if getattr(user, 'role_id', None) else None
                }
            )
            response_content = {
                "message": "Login successful",
                "token": access_token,
                "user": {
                    "email": user.email,
                    "user_id": str(user.uid),
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "class_id": str(user.class_id),
                    "current_usage": user.daily_usage
                }
            }
            if login_data.remember_me:
                refresh_token = create_access_token(
                    user_data={
                        "email": user.email,
                        "user_id": str(user.uid),
                        "role_id": str(getattr(user, 'role_id', '')) if getattr(user, 'role_id', None) else None
                    },
                    refresh=True,
                    expiry=timedelta(days=2)
                )
                response_content["refresh_token"] = refresh_token
            return JSONResponse(content=response_content)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid email or password")
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user found")
