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