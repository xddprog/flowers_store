from datetime import datetime, timedelta, timezone
from uuid import UUID

from app.core.dto.auth import LoginSchema, TokenSchema
from app.core.dto.admin import BaseAdminSchema
from app.core.repositories.admin_repository import AdminRepository
from app.infrastructure.database.models.admin import Admin
from app.infrastructure.errors.auth_errors import ForbiddenException, InvalidCredentials
from app.infrastructure.config.config import JWT_CONFIG

import jwt
from passlib.context import CryptContext


class AuthService:
    def __init__(self, repository: AdminRepository):
        self.repository = repository
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

    def _hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def _create_access_token(self, admin: Admin) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_CONFIG.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {"sub": str(admin.id), "exp": expire}
        encoded_jwt = jwt.encode(to_encode, JWT_CONFIG.SECRET_KEY, algorithm=JWT_CONFIG.ALGORITHM)
        return encoded_jwt

    def _create_refresh_token(self, admin: Admin) -> str:
        expire = datetime.now(timezone.utc) + timedelta(days=JWT_CONFIG.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {"sub": str(admin.id), "exp": expire}
        encoded_jwt = jwt.encode(to_encode, JWT_CONFIG.SECRET_KEY, algorithm=JWT_CONFIG.ALGORITHM)
        return encoded_jwt

    async def login_user(self, form: LoginSchema) -> TokenSchema:
        admin = await self.repository.get_by_filter(one_or_none=True, username=form.username)
        
        if not admin or not self._verify_password(form.password, admin.password_hash):
            raise InvalidCredentials()

        access_token = self._create_access_token(admin)
        refresh_token = self._create_refresh_token(admin)
        return TokenSchema(access_token=access_token, refresh_token=refresh_token)

    async def verify_token(self, token: str | None) -> dict:
        if not token:
            raise ForbiddenException()

        try:
            payload = jwt.decode(token, JWT_CONFIG.SECRET_KEY, algorithms=[JWT_CONFIG.ALGORITHM])
            return payload
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            raise InvalidCredentials()

    async def check_user_exist(self, token_data: dict) -> BaseAdminSchema:
        try:
            admin_id = UUID(token_data.get("sub"))
        except (ValueError, TypeError):
            raise InvalidCredentials()

        admin = await self.repository.get_by_filter(one_or_none=True, id=admin_id)
        if not admin:
            raise ForbiddenException()
        return BaseAdminSchema.model_validate(admin, from_attributes=True)

    async def refresh_token(self, refresh_token: str) -> TokenSchema:
        try:
            payload = await self.verify_token(refresh_token)
            admin_id = UUID(payload.get("sub"))
            
            admin = await self.repository.get_by_filter(id=admin_id, one_or_none=True)
            
            if not admin:
                raise InvalidCredentials()
                
            access_token = self._create_access_token(admin)
            new_refresh_token = self._create_refresh_token(admin)
            
            return TokenSchema(access_token=access_token, refresh_token=new_refresh_token)
            
        except (ValueError, TypeError):
            raise InvalidCredentials()
        