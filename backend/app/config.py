from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str
    anthropic_api_key: str
    secret_key: str
    use_json_storage: bool = True  # Use JSON files by default
    json_data_dir: str = "/home/ajbir/task-planner-app/data"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
