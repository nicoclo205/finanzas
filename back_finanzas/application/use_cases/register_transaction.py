from domain.transaction import Transaction
from application.ports.transaction_repository import TransactionRepository

class RegisterTransaction:
    """
    Use case that registers a new transaction.

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


    def execute(self, amount, transaction_type, method, date, category, description) -> Transaction:
        """
        Build a Transaction from raw data and persist it.

        Returns:
            The persisted Transaction, with its id assigned by the repository.
        """
        transaction = Transaction(
            amount=amount, 
            transaction_type=transaction_type, 
            method=method, 
            date=date, 
            category=category, 
            description=description)

        return self._repository.save(transaction)
    

    