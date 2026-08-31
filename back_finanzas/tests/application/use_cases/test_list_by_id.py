from domain.transaction import Transaction, TransactionType, Method, Category
from application.use_cases.get_by_id import GetById
from tests.fakes.in_memory_transaction_repository import InMemoryTransactionRepository
from datetime import date as dt

def test_get_transaction_by_id_is_None():
    """Fetching by an id that doesn't exist returns None."""

    repository = InMemoryTransactionRepository()
    use_case = GetById(repository=repository)

    result = use_case.execute(1)

    assert result is None

def test_get_transaction_by_id():
    """Fetching an existing transaction by id returns all its data correctly."""

    repository = InMemoryTransactionRepository()
    use_case = GetById(repository=repository)

    transaction = Transaction(
        amount=10000,
        transaction_type=TransactionType.EXPENSE,
        method=Method.CASH,
        date=dt.today(),
        category=Category.OUTINGS,
        description="Gasto para pasarla bien!"
        )

    repository.save(transaction=transaction)

    result = use_case.execute(1)

    assert result is not None
    assert result.id == transaction.id
    assert result.amount == transaction.amount
    assert result.transaction_type == transaction.transaction_type
    assert result.method == transaction.method
    assert result.date == transaction.date
    assert result.category == transaction.category
    assert result.description == transaction.description