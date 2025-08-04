from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.transaction_schemas import TransactionCreate, TransactionOut
from db.database import get_session
from dal_files.transaction_dal import TransactionDAL
from schemas.user_schemas import UserUpdate, UserBase
from dal_files.user_dal import UserDAL
from dependencies import get_current_user

userservice=UserDAL()

transaction_router = APIRouter()
transaction_service = TransactionDAL()

@transaction_router.post("/", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
async def create_transaction(model: TransactionCreate, current_user: UserBase = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    user_id = current_user.uid
    created = await transaction_service.create_transaction(model, user_id, session)
    await userservice.update_user(user_id=user_id, user_data=UserUpdate(subscription_id = model.subscription_id), db_session=session)
    return created

@transaction_router.get("/{transaction_id}", response_model=TransactionOut, status_code=status.HTTP_200_OK)
async def get_transaction_by_id(transaction_id: str, session: AsyncSession = Depends(get_session)):
    model = await transaction_service.get_transaction_by_id(transaction_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    return model

@transaction_router.get("/", response_model=list[TransactionOut], status_code=status.HTTP_200_OK)
async def get_all_transactions(session: AsyncSession = Depends(get_session)):
    models = await transaction_service.get_all_transactions(session)
    return models