from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from middleware import register_middleware
from db.database import init_db
# Import new controllers
from controllers.user_controller import user_router
from controllers.class_controller import class_router
from controllers.transaction_controller import transaction_router
from controllers.subscription_controller import subscription_router
from controllers.review_controller import review_router
from controllers.book_controller import book_router
from controllers.chapter_controller import chapter_router
from controllers.chapter_completion_controller import chapter_completion_router
from controllers.subject_controller import subject_router
from controllers.roles_controller import roles_router
# from controllers.gemini_controller import router as gemini_router


@asynccontextmanager
async def life_span(app:FastAPI):
    print("servre starting...")
    await init_db()
    yield
    print("sever has been stopped")

version="v1"

app=FastAPI(
    title="bookly",
    description="rest api forr book reviews",
    lifespan=life_span
)

register_middleware(app)

# New routers from controllers
app.include_router(user_router, prefix=f"/api/{version}/users", tags=["users"])
app.include_router(class_router, prefix=f"/api/{version}/classes", tags=["classes"])
app.include_router(transaction_router, prefix=f"/api/{version}/transactions", tags=["transactions"])
app.include_router(subscription_router, prefix=f"/api/{version}/subscriptions", tags=["subscriptions"])
app.include_router(review_router, prefix=f"/api/{version}/reviews", tags=["reviews"])
app.include_router(book_router, prefix=f"/api/{version}/books", tags=["books"])
app.include_router(chapter_router, prefix=f"/api/{version}/chapters", tags=["chapters"])
app.include_router(chapter_completion_router, prefix=f"/api/{version}/chaptercompletions", tags=["chaptercompletions"])
app.include_router(subject_router, prefix=f"/api/{version}/subjects", tags=["subjects"])
app.include_router(roles_router, prefix=f"/api/{version}/roles", tags=["roles"])
# app.include_router(gemini_router, prefix=f"/api/{version}/gemini", tags=["gemini"])