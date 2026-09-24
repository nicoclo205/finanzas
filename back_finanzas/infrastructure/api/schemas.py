from datetime import date as dt
from typing import Optional

from pydantic import BaseModel, ConfigDict

from domain.transaction import TransactionType, Method, Category

class TransactionBase(BaseModel):
    """
    Fields shared by every transaction DTO. Reuses the domain Enums
    directly (TransactionType, Method, Category) so Pydantic validates
    them without a separate mapping.
    """

    amount: float
    transaction_type: TransactionType
    method: Method
    date: dt
    category: Category
    description: str

class TransactionCreate(TransactionBase):
    """
    Request body for POST/PUT /transactions — same fields as
    TransactionBase, no id (assigned by the repository on persist).
    """
    pass

class TransactionResponse(TransactionBase):
    """
    Response body for the transaction endpoints. Can be built directly
    from a domain Transaction object (from_attributes=True), not only
    from a dict.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int


class ObjectiveBase(BaseModel):

    name: str
    target_amount: Optional[float] = None
    created_date: dt
    target_date: Optional[dt] = None

class ObjectiveCreate(ObjectiveBase):

    pass

class ObjectiveResponse(ObjectiveBase):

    model_config = ConfigDict(from_attributes=True)

    objective_id: int
    saved_amount: float


class ObjectiveMovementRequest(BaseModel):
    """
    Request body shared by POST /objectives/{id}/assign and
    /objectives/{id}/withdraw — no transaction_type/category, those are
    fixed internally by AssignToObjective/WithdrawFromObjective, and no
    objective_id, that comes from the URL path.
    """

    amount: float
    method: Method
    date: dt
    description: str
