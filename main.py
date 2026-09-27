from fastapi import FastAPI
from app.database.connection import Base, engine
from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.transaction import router as transaction_router

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MyMoney API")

# Include Routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(transaction_router)