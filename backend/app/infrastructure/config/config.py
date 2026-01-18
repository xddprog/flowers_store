from functools import lru_cache
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Определить корень проекта (где находится .env)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        case_sensitive=True,
        extra="ignore",
        env_nested_delimiter="__"
    )


class DatabaseConfig(Config):
    DB_NAME: str
    DB_USER: str
    DB_PASS: str
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    
    def get_url(self, is_async: bool = True) -> str:
        user, password, host, port, db = (
            self.DB_USER, self.DB_PASS, 
            self.DB_HOST, self.DB_PORT, self.DB_NAME
        )
        
        driver = "postgresql+asyncpg" if is_async else "postgresql"
        return f"{driver}://{user}:{password}@{host}:{port}/{db}"


class JWTConfig(Config):
    SECRET_KEY: str = Field(default="change-me-in-production")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=3)


class YandexPayConfig(Config):
    API_URL: str = Field(default="https://sandbox.pay.yandex.ru")
    ON_ERROR_REDIRECT_URL: str = Field(default="")
    ON_SUCCESS_REDIRECT_URL: str = Field(default="")
    ON_ABORT_REDIRECT_URL: str = Field(default="")
    CALLBACK_URL: str = Field(default="http://localhost:8000/api/v1/order/callback")
    REQUEST_TIMEOUT: int = Field(default=10)
    MAX_RETRIES: int = Field(default=3)
    API_KEY: str = Field(default="Mmgo3pWsvqso7PfoOKVdYw7MDNuP7zHPYTwT7px90vYoXvDlHc5dxRt31oeVvJ2QKzcu1g4dSyPNBiai")
    

class AppConfig(Config):
    APP_NAME: str = Field(default="4roads API")
    DEBUG: bool = Field(default=False)
    
    BASE_URL: str = Field(default="http://localhost:8000")
    STATIC_DIR: str = Field(default="static")
    IMAGES_DIR: str = Field(default="static/images")
    
    MAX_IMAGE_SIZE_MB: int = Field(default=10)
    WEBP_QUALITY: int = Field(default=85)
    
    SLOW_REQUEST_THRESHOLD: float = Field(default=1.0, description="Порог медленных запросов в секундах")

    CORS_ALLOWED_ORIGINS: str = Field(default="http://localhost:3000,http://localhost:5173")



class SMTPConfig(Config):
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_PORT: int
    SMTP_HOST: str


class TelegramConfig(Config):
    BOT_TOKEN: str = Field(default="")
    ADMIN_CHAT_ID: str = Field(default="", description="ID чата для уведомлений администратора")


class Settings(Config):
    smtp: SMTPConfig = Field(default_factory=SMTPConfig)
    telegram: TelegramConfig = Field(default_factory=TelegramConfig)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    jwt: JWTConfig = Field(default_factory=JWTConfig)
    app: AppConfig = Field(default_factory=AppConfig)
    yandex_pay: YandexPayConfig = Field(default_factory=YandexPayConfig)

settings = Settings()

SMTP_CONFIG = settings.smtp
TELEGRAM_CONFIG = settings.telegram
DB_CONFIG = settings.database
JWT_CONFIG = settings.jwt
APP_CONFIG = settings.app
YANDEX_PAY_CONFIG = settings.yandex_pay