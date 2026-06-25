from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./signal_clone.db"

# connect_args={"check_same_thread": False} is needed only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DBMessage(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, index=True)
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create the tables
Base.metadata.create_all(bind=engine)