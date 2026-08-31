from domain.transaction import Transaction, TransactionType, Method, Category
from application.use_cases.remove_transaction import RemoveTransaction
from tests.fakes.in_memory_transaction_repository import InMemoryTransactionRepository
from datetime import date as dt

def test_remove_transaction():
    """Removing an existing transaction returns True and empties the repository."""

    repository = InMemoryTransactionRepository()
    use_case = RemoveTransaction(repository=repository)

    transaction = Transaction(
        amount=10000,
        transaction_type=TransactionType.EXPENSE,
        method=Method.CASH,
        date=dt.today(),
        category=Category.OUTINGS,
        description="Gasto para pasarla bien!"
        )

    repository.save(transaction=transaction)

    result = use_case.execute(id=1)

    assert result is True
    assert repository.list_all() == []


def test_remove_transaction_not_found():
    """Removing an id that doesn't exist returns False."""

    repository = InMemoryTransactionRepository()
    use_case = RemoveTransaction(repository=repository)

    result = use_case.execute(id=1)

    assert result is False