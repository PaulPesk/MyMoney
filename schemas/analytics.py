from pydantic import BaseModel
from typing import List

class AnalyticsSummaryResponse(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float

class CategoryExpenseResponse(BaseModel):
    category: str
    total_amount: float

class CategoryAnalyticsResponse(BaseModel):
    expenses_by_category: List[CategoryExpenseResponse]