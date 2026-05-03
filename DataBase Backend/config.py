from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

DOTENV = os.path.join(os.path.dirname(__file__), ".env")
class Settings(BaseSettings):
    database_hostname: str 
    database_password: str 
    database_name:str
    database_username:str
    database_port:str
    jwt_secret:str
    jwt_algorithm:str
    redis_host:str
    redis_port:int
    google_client_id:str
    redis_password:str
    gdrive_service_account_file: str
    gdrive_folder_id: str
    gemini_api_key: str
    # Loaded from env var YOUTUBE_API_KEY (same pattern as GEMINI_API_KEY in .env)
    youtube_api_key: Optional[str] = Field(default=None, validation_alias="YOUTUBE_API_KEY")

    class Config:
        env_file = DOTENV  
        env_file_encoding = 'utf-8'
        
    
settings=Settings()

QUIZ_QUESTIONS_PER_ATTEMPT = 10
QUIZ_PASS_PERCENTAGE       = 70
