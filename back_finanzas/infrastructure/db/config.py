from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class DatabaseSettings(BaseSettings):
    """
    Configures the connection to the real db. It searches the real env value for the connector
    """
    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8")

    db_connector: str


settings = DatabaseSettings()  # type: ignore[call-arg]
