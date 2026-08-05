from application.ports.transaction_repository import TransactionRepository
from domain.transaction import Transaction

class InMemoryTransactionRepository(TransactionRepository):

    def __init__(self):
        self._transactions = []
        self._next_id = 1

    def save(self, transaction: Transaction) -> Transaction:

        transaction.id = self._next_id
        self._next_id += 1

        self._transactions.append(transaction)

        return transaction