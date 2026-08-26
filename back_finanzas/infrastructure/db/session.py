from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from infrastructure.db.config import settings

engine = create_engine(settings.db_connector)

SessionLocal = sessionmaker(bind=engine)

def get_db():
    """
    Starts, yields, and ends a session of the db engine
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

