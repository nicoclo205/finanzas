from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

class ApiSettings(BaseSettings):
    """
    Configures the connection to the api. It searches the real env value for the api key
    """

    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8", extra="ignore")

    api_key: str

settings = ApiSettings() # type: ignore[call-arg]
