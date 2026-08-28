from application.use_cases.list_transactions import ListTransactions
from tests.fakes.in_memory_transaction_repository import InMemoryTransactionRepository
from domain.transaction import Transaction, TransactionType, Method, Category
from datetime import date as dt

def test_no_transaction_in_list():

    repository = InMemoryTransactionRepository()
    use_case = ListTransactions(repository=repository)

    result = use_case.execute()

    assert len(result) == 0


def test_fetch_transactions_list():

    repository = InMemoryTransactionRepository()

    for i in range(1, 5, 1):
        transaction = Transaction(
            amount=10000,
            transaction_type=TransactionType.EXPENSE,
            method=Method.CASH,
            date=dt.today(),
            category=Category.OUTINGS,
            description="Gasto para pasarla bien!"
        )

        repository.save(transaction=transaction)
    
    use_case = ListTransactions(repository=repository)
    result = use_case.execute()

    ids = [t.id for t in result]

    assert len(result) == 4
    assert ids == [1, 2, 3, 4]