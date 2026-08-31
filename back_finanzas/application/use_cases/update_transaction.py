from application.ports.transaction_repository import TransactionRepository
from domain.transaction import Transaction
from typing import Optional

class UpdateTransaction:
    """
    Use case that updates an existing transaction with new data.

    Depends on the TransactionRepository port, not on a concrete
    implementation, so it can work with any adapter (in-memory,
    Postgres, etc.) that fulfills the contract.
    """

    def __init__(self, repository: TransactionRepository) -> None:
        """
        Args:
            repository: Concrete implementation of TransactionRepository
                used to persist the updated transaction.
        """
        self._repository = repository

    def execute(self, id: int, amount, transaction_type, method, date, category, description) -> Optional[Transaction]:
        """
        Build a Transaction from raw data and persist it in place of the
        transaction with the given id.

        Returns:
            The updated Transaction, or None if no transaction with
            that id exists.
        """
        transaction = Transaction(
            amount=amount, 
            transaction_type=transaction_type, 
            method=method, 
            date=date, 
            category=category, 
            description=description) 

        return self._repository.update(id=id, transaction=transaction) 