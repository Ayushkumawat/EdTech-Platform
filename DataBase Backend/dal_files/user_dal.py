from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from models.user import User
from schemas.user_schemas import UserCreate, UserUpdate
from utils import generate_passwd_hash
from sqlalchemy.exc import IntegrityError
from .roles_dal import RoleDAL
from .subscription_dal import SubscriptionDAL
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from config import settings
import logging
from fastapi import HTTPException
import random
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText

roles_services = RoleDAL()
subscriptions_services = SubscriptionDAL()

logger = logging.getLogger(__name__)

class UserDAL:
    async def create_user(self, user_data: UserCreate, db_session: AsyncSession) -> User:
        user_data_dict = user_data.model_dump()
        raw_password = user_data_dict.pop("password", None)
        google_id = user_data_dict.get("google_id")
        if google_id and raw_password:
            raise HTTPException(status_code=400, detail="A user cannot have both a password and a google_id.")
        if not google_id and not raw_password:
            raise HTTPException(status_code=400, detail="Either a password or a google_id is required to create a user.")
        password_hash = generate_passwd_hash(raw_password) if not google_id else None
        new_user = User(**user_data_dict)
        new_user.password_hash = password_hash
        default_role = await roles_services.get_role_by_name("user", db_session)
        default_subscription = await subscriptions_services.get_subscription_by_name("Free", db_session)
        if not default_role:
            raise HTTPException(status_code=400, detail="Default role not found")
        if not default_subscription:
            raise HTTPException(status_code=400, detail="Default subscription not found")
        new_user.role_id = default_role.uid
        new_user.subscription_id = default_subscription.uid
        new_user.daily_credits = default_subscription.daily_limit
        try:
            db_session.add(new_user)
            await db_session.commit()
            await db_session.refresh(new_user)
        except IntegrityError as e:
            await db_session.rollback()
            raise HTTPException(status_code=400, detail=f"Failed to create user: {e}")
        return new_user

    async def get_user_by_id(self, user_id: str, db_session: AsyncSession) -> User:
        return await db_session.get(User, user_id)

    async def get_user_by_email(self, email: str, db_session: AsyncSession) -> User:
        result = await db_session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def update_user(self, user_id: str, user_data: UserUpdate, db_session: AsyncSession) -> User:
        user = await self.get_user_by_id(user_id, db_session)
        if not user:
            return None
        for key, value in user_data.model_dump(exclude_unset=True).items():
            setattr(user, key, value)
        await db_session.commit()
        await db_session.refresh(user)
        return user
    
    async def update_credits(self, user_id: str, token_used:int, db_session: AsyncSession) :
        user = await self.get_user_by_id(user_id, db_session)
        if not user:
            return None
        if user.daily_credits <= 0:
            return {"Status": "Inactive"}
        else:
            if user.daily_credits - token_used < 0:
                user.daily_credits = 0
            else:
                user.daily_credits = user.daily_credits - token_used
            await db_session.commit()
            await db_session.refresh(user)
            return {"Status": "Active"}

    async def delete_user(self, user_id: str, db_session: AsyncSession) -> bool:
        user = await self.get_user_by_id(user_id, db_session)
        if not user:
            return False
        await db_session.delete(user)
        await db_session.commit()
        return True

    async def change_user_role(self, user_id: str, new_role_id: str, db_session: AsyncSession) -> User:
        user = await self.get_user_by_id(user_id, db_session)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found.")
        new_role = await roles_services.get_role_by_id(new_role_id, db_session)
        if not new_role:
            raise HTTPException(status_code=404, detail=f"Role with ID {new_role_id} not found.")
        user.role_id = new_role_id
        try:
            await db_session.commit()
            await db_session.refresh(user)
        except IntegrityError as e:
            await db_session.rollback()
            raise HTTPException(status_code=400, detail=f"Failed to change user role: {e}")
        return user

    async def get_all_users(self, db_session: AsyncSession) -> list[User]:
        result = await db_session.execute(select(User))
        return result.scalars().all()

    async def verify_google_token(self, id_token: str):
        try:
            idinfo = google_id_token.verify_oauth2_token(
                id_token, google_requests.Request(), settings.google_client_id
            )
            if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                raise HTTPException(status_code=400, detail="Invalid token issuer.")
            user_info = {
                "sub": idinfo["sub"],
                "email": idinfo.get("email"),
                "first_name": idinfo.get("given_name", ""),
                "last_name": idinfo.get("family_name", ""),
                "picture": idinfo.get("picture", ""),
            }
            return user_info
        except ValueError:
            return None

    async def save_otp(self, email: str, otp_code: str, expiry_minutes: int, db_session: AsyncSession):
        user = await self.get_user_by_email(email, db_session)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.otp_code = otp_code
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=expiry_minutes)
        await db_session.commit()
        await db_session.refresh(user)
        return user

    async def verify_otp(self, email: str, otp_code: str, db_session: AsyncSession):
        user = await self.get_user_by_email(email, db_session)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.otp_code != otp_code:
            raise HTTPException(status_code=400, detail="Invalid OTP code")
        if user.otp_expiry < datetime.utcnow():
            raise HTTPException(status_code=400, detail="OTP expired")
        user.is_verified = True
        user.otp_code = None
        user.otp_expiry = None
        await db_session.commit()
        await db_session.refresh(user)
        return user

    async def send_otp_via_email(self, email: str, otp_code: str):
        print(f"Sending OTP {otp_code} to {email}")
        return True

    def generate_otp(self, length: int = 6) -> str:
        return ''.join([str(random.randint(0, 9)) for _ in range(length)])
