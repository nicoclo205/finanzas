from application.ports.transaction_repository import TransactionRepository
from domain.transaction import Transaction
from typing import Optional

class GetById:
    """
    Use case that fetches a single transaction by its id.

    Depends on the TransactionRepository port, not on a concrete
    implementation, so it can work with any adapter (in-memory,
    Postgres, etc.) that fulfills the contract.
    """

    def __init__(self, repository: TransactionRepository) -> None:
        """
        Args:
            repository: Concrete implementation of TransactionRepository
                used to fetch the transaction.
        """
        self._repository = repository

    def execute(self, id: int) -> Optional[Transaction]:
        """
        Fetch the transaction with the given id.

        Returns:
            The matching Transaction, or None if no transaction with
            that id exists.
        """
        return self._repository.get_by_id(id=id)