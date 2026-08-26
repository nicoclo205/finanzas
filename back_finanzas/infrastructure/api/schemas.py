from datetime import date as dt

from pydantic import BaseModel, ConfigDict

from domain.transaction import TransactionType, Method, Category

class TransactionBase(BaseModel):
    amount: float
    transaction_type: TransactionType
    method: Method
    date: dt
    category: Category
    description: str

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int