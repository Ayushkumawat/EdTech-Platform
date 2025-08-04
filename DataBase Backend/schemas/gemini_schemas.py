from pydantic import BaseModel

class AskRequest(BaseModel):
    text: str

class AskImageRequest(BaseModel):
    url: str
    text: str = ""