from application.ports.transaction_repository import TransactionRepository

class RemoveTransaction:
    """
    Use case that deletes a transaction by its id.

    Depends on the TransactionRepository port, not on a concrete
    implementation, so it can work with any adapter (in-memory,
    Postgres, etc.) that fulfills the contract.
    """

    def __init__(self, repository: TransactionRepository) -> None:
        """
        Args:
            repository: Concrete implementation of TransactionRepository
                used to delete the transaction.
        """
        self._repository = repository

    def execute(self, id):
        """
        Delete the transaction with the given id.

        Returns:
            True if a transaction was deleted, False if no transaction
            with that id existed.
        """
        return self._repository.remove(id=id)