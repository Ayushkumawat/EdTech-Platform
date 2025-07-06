from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.subscription_schemas import SubscriptionCreate, SubscriptionOut, SubscriptionUpdate
from db.database import get_session
from dal_files.subscription_dal import SubscriptionDAL

subscription_router = APIRouter()
subscription_service = SubscriptionDAL()

@subscription_router.post("/", response_model=SubscriptionOut, status_code=status.HTTP_201_CREATED)
async def create_subscription(model: SubscriptionCreate, session: AsyncSession = Depends(get_session)):
    created = await subscription_service.create_subscription(model, session)
    return created

@subscription_router.get("/{subscription_id}", response_model=SubscriptionOut, status_code=status.HTTP_200_OK)
async def get_subscription_by_id(subscription_id: str, session: AsyncSession = Depends(get_session)):
    model = await subscription_service.get_subscription_by_id(subscription_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")
    return model

@subscription_router.get("/", response_model=list[SubscriptionOut], status_code=status.HTTP_200_OK)
async def get_all_subscriptions(session: AsyncSession = Depends(get_session)):
    models = await subscription_service.get_all_subscriptions(session)
    return models

@subscription_router.put("/{subscription_id}", response_model=SubscriptionOut, status_code=status.HTTP_200_OK)
async def update_subscription(subscription_id: str, model: SubscriptionUpdate, session: AsyncSession = Depends(get_session)):
    updated = await subscription_service.update_subscription(subscription_id, model, session)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")
    return updated

@subscription_router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription(subscription_id: str, session: AsyncSession = Depends(get_session)):
    deleted = await subscription_service.delete_subscription(subscription_id, session)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")
    return
