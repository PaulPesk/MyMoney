from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from models.transaction import Transaction
from api.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    
    total_income = sum(t.amount for t in transactions if str(t.type).upper() == "INCOME")
    total_expense = sum(t.amount for t in transactions if str(t.type).upper() == "EXPENSE")
    net_balance = total_income - total_expense
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": net_balance
    }

@router.get("/by-category")
def get_expenses_by_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Φιλτράρουμε στη Python για να αποφύγουμε ασυμβατότητες με PostgreSQL ENUM τύπους
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    
    by_category = {}
    for t in transactions:
        if str(t.type).upper() == "EXPENSE":
            by_category[t.category] = by_category.get(t.category, 0.0) + t.amount
        
    return by_category