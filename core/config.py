import os

class Settings:
    """Central application configuration using environment variables."""
    
    # Project Info
    PROJECT_NAME: str = "MyMoney API"
    PROJECT_VERSION: str = "1.0.0"
    
    # PostgreSQL Database Credentials
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "mymoney_user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "mymoney_password")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "mymoney_db")
    
    # Constructed Database URL for SQLAlchemy
    DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    # JWT Authentication Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION_123456789")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

# Instantiate global settings object
settings = Settings()