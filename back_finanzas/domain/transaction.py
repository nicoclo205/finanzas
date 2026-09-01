from enum import Enum
from dataclasses import dataclass
from datetime import date as dt
from typing import Optional
from domain.exceptions import InvalidAmountError, InvalidDescriptionError

class TransactionType(Enum):
    """
    Class for the transaction type posibilities.
    """
    INCOME = "ingreso"
    EXPENSE = "gasto"

class Method(Enum):
    """
    Class for the method of payment.
    """
    CASH = "efectivo"
    TRANSFER = "transferencia"
    DEBIT_CARD = "tarjeta de débito"
    CREDIT_CARD = "tarjeta de crédito"

class Category(Enum):
    """
    Class for the categories.
    """
    FOOD = "comida"
    TRANSPORT = "transporte"
    OUTINGS = "salidas"
    LEISURE = "ocio"
    JOB = "trabajo"
    PARENTS = "padres"
    OTHER = "otro"

    SAVINGS = "ahorro"

@dataclass
class Transaction:

    """
    Model of bussiness that the system will perform.
    """
    
    amount: float
    transaction_type: TransactionType #income/expense
    method: Method  #payment by card, cash or transfer
    date: dt
    category: Category  #Category under which the transaction was made (food, transport, joy, etc...)
    description: str
    id: Optional[int] = None
    objective_id: Optional[int] = None

    def __post_init__(self):
        if self.amount <= 0:
            raise InvalidAmountError("El monto debe ser mayor a 0.")

        if self.amount > 100000000:
            raise InvalidAmountError("El monto no tiene una cifra realista.")

        if len(self.description) > 100:
            raise InvalidDescriptionError("La descripción tiene demasiados caracteres.")

    
    


