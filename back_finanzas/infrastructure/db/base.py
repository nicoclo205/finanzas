"""
Shared SQLAlchemy declarative base — every ORM model in infrastructure/db
inherits from this Base so they register on the same metadata.
"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()
