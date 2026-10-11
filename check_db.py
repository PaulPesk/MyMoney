from database.connection import SessionLocal
from models.user import User
from models.transaction import Transaction

def inspect_database():
    db = SessionLocal()
    try:
        print("================================")
        print("          USERS LIST            ")
        print("================================")
        users = db.query(User).all()
        if not users:
            print("No users found in the database.")
        for u in users:
            print(f"ID: {u.id} | Email: {u.email}")

        print("\n================================")
        print("      TRANSACTIONS LIST         ")
        print("================================")
        transactions = db.query(Transaction).all()
        if not transactions:
            print("No transactions found in the database.")
        for t in transactions:
            print(f"ID: {t.id} | User ID: {t.user_id} | Type: {t.type} | Category: {t.category} | Amount: €{t.amount}")
            
    except Exception as e:
        print(f"An error occurred while inspecting the database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_database()