from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
from database import SessionLocal, DBMessage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # We create a local session for the websocket lifecycle
    db = SessionLocal() 
    try:
        while True:
            data = await websocket.receive_text()
            
            # 1. Save to Database (The Top 1% move)
            new_msg = DBMessage(sender="user", text=data)
            db.add(new_msg)
            db.commit()
            
            # 2. Broadcast to everyone
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        db.close()