from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Προσθήκη της σχέσης 1-προς-Πολλά με τα Transactions
    transactions = relationship("Transaction", back_populates="owner", cascade="all, delete-orphan")