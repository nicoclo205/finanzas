from domain.transaction import Transaction
from application.ports.transaction_repository import TransactionRepository

class ListTransactions:
    """
        Use case that fetches all transactions.
    
        Depends on the TransactionRepository port, not on a concrete
        implementation, so it can work with any adapter (in-memory,
        Postgres, etc.) that fulfills the contract.
        """

    def __init__(self, repository: TransactionRepository) -> None:
        """
        Args:
            repository: Concrete implementation of TransactionRepository
            used to persist the transaction.
        """
        self._repository = repository

    def execute(self) -> list[Transaction]:
        """
        Fetches all the transactions.

        Returns:
            The persisted Transactions.
        """
        return self._repository.list_all()