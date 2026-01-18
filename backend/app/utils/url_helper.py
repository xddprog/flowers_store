from app.infrastructure.config.config import APP_CONFIG


def get_absolute_url(path: str) -> str:
    if not path:
        return None
    return f"{APP_CONFIG.BASE_URL}/{APP_CONFIG.IMAGES_DIR}/{path}"