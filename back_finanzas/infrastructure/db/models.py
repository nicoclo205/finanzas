from datetime import date as dt
from typing import Optional

from sqlalchemy import String, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.db.base import Base


class TransactionModel(Base):
    """
    db structure for transaction
    """
    __tablename__ = "transactions"

    #Primary key
    id: Mapped[int] = mapped_column(primary_key=True)

    # Variables
    amount: Mapped[float] = mapped_column(nullable=False)
    transaction_type: Mapped[str] = mapped_column(String, nullable=False)
    method: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[dt] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String(100), nullable=False)

    # Foreign key
    objective_id: Mapped[Optional[int]] = mapped_column(ForeignKey("objectives.id"), nullable=True)


class ObjectiveModel(Base):
    """
    db structure for objectives
    """
    __tablename__ = "objectives"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    target_amount: Mapped[Optional[float]] = mapped_column(nullable=True)
    created_date: Mapped[dt] = mapped_column(nullable=False)
    target_date: Mapped[Optional[dt]] = mapped_column(nullable=True)
    saved_amount: Mapped[float] = mapped_column(nullable=False)

