from abc import ABC, abstractmethod
from domain.transaction import Transaction

class TransactionRepository(ABC):
    """
    Port defining the persistence contract for transactions.

    Concrete adapters (in-memory, Postgres, etc.) implement this
    interface so the application layer never depends on a specific
    storage technology.
    """

    @abstractmethod
    def save(self, transaction: Transaction) -> Transaction:
        """
        Persist a transaction and return it with its assigned id.                                         
        """
        ...

    @abstractmethod
    def list_all(self) -> list[Transaction]:
        """
        Returns the list of the transactions done.
        """
        ...
