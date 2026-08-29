from typing import Optional

from application.ports.transaction_repository import TransactionRepository
from domain.transaction import Transaction

class InMemoryTransactionRepository(TransactionRepository):

    def __init__(self):
        self._transactions = []
        self._next_id = 1

    def save(self, transaction: Transaction) -> Transaction:
        """
        Simulates a bd with a list where the transaction objects are created with an increasing id
        """
        transaction.id = self._next_id
        self._next_id += 1

        self._transactions.append(transaction)

        return transaction


    def list_all(self) -> list[Transaction]:
        """
        Simulates a get option where the list of transactions is fetched
        """
        return list(self._transactions)
    

    def get_by_id(self, id: int) -> Optional[Transaction]:
        """
        Simulates a get option where an specific transaction is fetched by its id
        """
        return next((t for t in self._transactions if t.id == id), None)
    

    def remove(self, id: int) -> bool:
        """
        Simulates a transaction being deleted using the id
        """

        transaction = next((t for t in self._transactions if t.id == id), None)

        if transaction is None:
            return False

        self._transactions.remove(transaction)
        return True
    