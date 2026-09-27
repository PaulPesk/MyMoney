from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.transaction import TransactionType


class TransactionBase(BaseModel):
    amount: float = Field(gt=0, example=45.50)
    description: Optional[str] = Field(default=None, example="Supermarket")
    category: str = Field(example="Food")
    type: TransactionType = Field(example="EXPENSE")


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    user_id: int

    model_config = ConfigDict(from_attributes=True)