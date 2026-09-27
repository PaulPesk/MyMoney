from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.schemas.analytics import AnalyticsSummaryResponse, CategoryAnalyticsResponse
from app import models
from app.database.connection import get_db
from app.api.dependencies import get_current_user  # Ή από όπου κάνεις import το get_current_user

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_financial_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Υπολογισμός συνολικών εισοδημάτων (INCOME)
    total_income = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0))\
        .filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.type == "INCOME"
        ).scalar()

    # Υπολογισμός συνολικών εξόδων (EXPENSE)
    total_expenses = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0))\
        .filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.type == "EXPENSE"
        ).scalar()

    net_balance = total_income - total_expenses

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_balance": net_balance
    }


@router.get("/by-category", response_model=CategoryAnalyticsResponse)
def get_expenses_by_category(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Άθροισμα εξόδων ανά κατηγορία
    results = db.query(
        models.Transaction.category,
        func.sum(models.Transaction.amount).label("total_amount")
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == "EXPENSE"
    ).group_by(models.Transaction.category).all()

    expenses = [
        {"category": row.category, "total_amount": row.total_amount}
        for row in results
    ]

    return {"expenses_by_category": expenses}