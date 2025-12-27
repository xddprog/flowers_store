from __future__ import annotations

from pydantic import BaseModel, Field


class LoginSchema(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=5)


class RefreshTokenSchema(BaseModel):
    refresh_token: str


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
