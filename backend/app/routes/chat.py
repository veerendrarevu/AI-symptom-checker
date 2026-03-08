
from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.models.chat import ChatCreate, Message
from app.services.ai_model import generate_response
from app.utils.security import get_current_user
from bson import ObjectId

router = APIRouter()

# helper to convert string id to ObjectId and check validity

def oid(id_str: str):
    try:
        return ObjectId(id_str)
    except Exception:
        return None

@router.post("/create")
async def create_chat(chat: ChatCreate, user_id: str = Depends(get_current_user)):
    # each chat belongs to a user
    data = {"title": chat.title, "messages": [], "user_id": user_id}
    res = await db.chats.insert_one(data)
    return {"chat_id": str(res.inserted_id)}

@router.get("/")
async def list_chats(user_id: str = Depends(get_current_user)):
    # return all chats for this user
    cursor = db.chats.find({"user_id": user_id})
    chats = []
    async for c in cursor:
        chats.append({"chat_id": str(c["_id"]), "title": c.get("title")})
    return chats

@router.get("/{chat_id}")
async def get_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    oid_val = oid(chat_id)
    if not oid_val:
        raise HTTPException(status_code=400, detail="Invalid chat id")
    chat = await db.chats.find_one({"_id": oid_val, "user_id": user_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"chat_id": str(chat["_id"]), "title": chat.get("title"), "messages": chat.get("messages", [])}

@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    oid_val = oid(chat_id)
    if not oid_val:
        raise HTTPException(status_code=400, detail="Invalid chat id")
    result = await db.chats.delete_one({"_id": oid_val, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"message": "Chat deleted"}

@router.post("/{chat_id}/message")
async def send_message(chat_id: str, msg: Message, user_id: str = Depends(get_current_user)):
    oid_val = oid(chat_id)
    if not oid_val:
        raise HTTPException(status_code=400, detail="Invalid chat id")
    chat = await db.chats.find_one({"_id": oid_val, "user_id": user_id})
    history = chat.get("messages", []) if chat else []

    try:
        response = await generate_response(history, msg.content)
    except Exception as e:
        # log full traceback for debugging
        import traceback
        tb = traceback.format_exc()
        print(f"Error in generate_response: {e}\n{tb}")
        # persist the user message even if the AI call fails
        await db.chats.update_one(
            {"_id": oid_val, "user_id": user_id},
            {"$push": {"messages": {"role": "user", "content": msg.content}}}
        )
        # inform the client without a 502 so the frontend can still render
        return {"response": "Sorry, I'm having trouble contacting the AI service right now. Please try again later."}

    await db.chats.update_one(
    {"_id": oid_val, "user_id": user_id},
    {"$push": {
        "messages": {
            "$each": [
                {"role": "user", "content": msg.content},
                {"role": "assistant", "content": response}
            ]
        }
    }}
)
    # for debugging this print can be removed later
    print(response)

    return {"response": response}
