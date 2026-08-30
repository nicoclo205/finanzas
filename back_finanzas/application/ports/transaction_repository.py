from abc import ABC, abstractmethod
from typing import Optional
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

    @abstractmethod
    def get_by_id(self, id: int) -> Optional[Transaction]:
        """
        Return the transaction filtered by id.
        """
        ...

    @abstractmethod
    def remove(self, id: int) -> bool:
        """
        Deletes a transaction selected by an id.
        """
        ...

    @abstractmethod
    def update(self, id: int, transaction: Transaction) -> Optional[Transaction]:
        """
        Updates a transaction selected by an id, returning the updated
        transaction, or None if no transaction with that id exists.
        """
        ...