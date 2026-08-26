from datetime import date as dt

from sqlalchemy import String, Date
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.db.base import Base


class TransactionModel(Base):
    """
    db structure
    """
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    amount: Mapped[float] = mapped_column(nullable=False)
    transaction_type: Mapped[str] = mapped_column(String, nullable=False)
    method: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[dt] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String(100), nullable=False)
