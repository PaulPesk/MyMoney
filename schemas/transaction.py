from pydantic import BaseModel

class TransactionBase(BaseModel):
    amount: float
    type: str  # "INCOME" or "EXPENSE"
    category: str

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True