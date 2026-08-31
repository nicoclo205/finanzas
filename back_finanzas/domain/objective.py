from domain.exceptions import InvalidAmountError, InvalidNameError
from dataclasses import dataclass
from typing import Optional
from datetime import date as dt

@dataclass
class Objective:
    """
    Model of a savings goal or open savings bucket (e.g. "cuenta de
    ahorros", "viaje a Bariloche").
    """

    name: str
    target_amount: Optional[float]  #goal to reach; None for open-ended savings
    created_date: dt
    target_date: Optional[dt]  #optional deadline
    saved_amount: float = 0  #accumulated so far; starts at 0
    id: Optional[int] = None  #assigned on persist, not on creation in memory

    def __post_init__(self):

        if not self.name.strip():
            raise InvalidNameError("El nombre no puede estar vacío.")

        if len(self.name) > 100:
            raise InvalidNameError("El nombre tiene demasiados caracteres.")

        if self.target_amount is not None and self.target_amount <= 0:
            raise InvalidAmountError("El monto debe ser mayor a 0.")

        if self.target_amount is not None and self.target_amount > 100000000:
            raise InvalidAmountError("El monto no tiene una cifra realista.")

        if self.saved_amount < 0:
            raise InvalidAmountError("El monto debe ser mayor a 0.")