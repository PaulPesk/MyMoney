from datetime import date
from typing import Optional
from pydantic import BaseModel

class TransactionBase(BaseModel):
    amount: float
    type: str  # "INCOME" or "EXPENSE"
    category: str
    date: Optional[date] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    date: date

    class Config:
        from_attributes = True