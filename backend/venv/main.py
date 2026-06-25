from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal, DBMessage

app = FastAPI()

# Allow cross-origin requests from the Next.js frontend
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

    # Broadcast message to all clients, optionally excluding the sender
    async def broadcast(self, message: str, exclude: WebSocket = None):
        for connection in self.active_connections:
            if connection != exclude:
                await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Open a database session for this specific websocket connection
    db = SessionLocal() 
    try:
        while True:
            # Wait for a message from the client
            data = await websocket.receive_text()
            
            # 1. Save the message to the SQLite Database
            new_msg = DBMessage(sender="user", text=data)
            db.add(new_msg)
            db.commit()
            
            # 2. Broadcast to everyone EXCEPT the person who just sent it
            await manager.broadcast(data, exclude=websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        # Always close the database connection when the user disconnects
        db.close()