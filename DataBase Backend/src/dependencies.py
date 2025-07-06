from fastapi.security import HTTPBearer
from fastapi import Request, status, Depends
from fastapi.security.http import HTTPAuthorizationCredentials
from utils import decode_token
from fastapi.exceptions import HTTPException
from db.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from dal_files.user_dal import UserDAL
from dal_files.roles_dal import RoleDAL
from typing import List, Any
from schemas.user_schemas import UserBase, UserOut
from db.redis_store import token_in_blocklist

user_service = UserDAL()
role_service = RoleDAL()

class TokenBearer(HTTPBearer):
    def __init__(self, auto_error=True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials | None:
        creds = await super().__call__(request)
        token = creds.credentials
        token_data = decode_token(token)
        if not self.token_valid(token):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="invalid or expired token"
            )
        
        self.verify_token_data(token_data)
        return token_data

    def token_valid(self, token: str) -> bool:
        token_data = decode_token(token)
        return token_data is not None

    def verify_token_data(self, token_data):
        raise NotImplementedError("please Override this method in child class")

class AccessTokenBearer(TokenBearer):
    def verify_token_data(self, token_data: dict) -> None:
        if token_data and token_data["refresh"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="provide an access token"
            )

class RefreshTokenBearer(TokenBearer):
    def verify_token_data(self, token_data: dict) -> None:
        if token_data and not token_data["refresh"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="provide a Refresh token"
            )

async def get_current_user(
    token_detail: dict = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session)
):
    user_email = token_detail.get("user", {}).get("email")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token payload: missing 'user.email'."
        )
    user = await user_service.get_user_by_email(user_email, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]) -> None:
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: UserBase = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> bool:
        role = await role_service.get_role_by_id(current_user.role_id, session)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Role not found."
            )
        if role.name in self.allowed_roles:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have the required role to access this resource."
        )

async def validate_daily_usage_limit(
    current_user: UserOut = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Dependency to validate if the user's daily usage is within their subscription's daily limit.
    Raises HTTPException if the limit is exceeded.
    """
    # Fetch the user's subscription (replace with your actual DAL/service method)
    from dal_files.subscription_dal import SubscriptionDAL
    subscription_service = SubscriptionDAL()
    subscription = await subscription_service.get_subscription_by_id(current_user.subscription_id, session)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active subscription found."
        )
    daily_limit = getattr(subscription, 'daily_limit', None)
    if daily_limit is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Subscription does not have a daily limit set."
        )
    # Fetch the user's current daily usage (replace with your actual DAL/service method)
    from dal_files.user_dal import UserDAL
    user_service = UserDAL()
    # daily_usage = await user_service.get_user_by_id(current_user.id, session)
    daily_usage = current_user.daily_usage
    print("################################", daily_usage, "################################")
    if daily_usage >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily usage limit reached: {daily_usage}/{daily_limit}"
        )
    return current_user
