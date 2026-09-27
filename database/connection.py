from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Δημιουργία SQLAlchemy Engine
engine = create_engine(settings.DATABASE_URL)

# Δημιουργία Session DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class για τα Database Models
Base = declarative_base()

# Dependency για τη λήψη συνεδρίας στη βάση δεδομένων
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()