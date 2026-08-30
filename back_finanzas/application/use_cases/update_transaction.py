from application.ports.transaction_repository import TransactionRepository
from domain.transaction import Transaction
from typing import Optional

class UpdateTransaction:

    def __init__(self, repository: TransactionRepository) -> None:
        self._repository = repository

    def execute(self, id: int, amount, transaction_type, method, date, category, description) -> Optional[Transaction]:

        transaction = Transaction(
            amount=amount, 
            transaction_type=transaction_type, 
            method=method, 
            date=date, 
            category=category, 
            description=description) 

        return self._repository.update(id=id, transaction=transaction) 