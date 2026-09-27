from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """Schema for the token response returned upon successful authentication."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema representing the payload encoded inside the JWT."""

    user_id: Optional[int] = None