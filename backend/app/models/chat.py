
from pydantic import BaseModel

class ChatCreate(BaseModel):
    title: str

class Message(BaseModel):
    content: str
