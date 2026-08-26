import pytest
from application.use_cases.register_transaction import RegisterTransaction
from domain.transaction import TransactionType, Method, Category
from domain.exceptions import InvalidAmountError
from tests.fakes.in_memory_transaction_repository import InMemoryTransactionRepository
from datetime import date as dt

def test_execute_saves_and_returns_transaction_with_id():

    transaction_type = TransactionType.EXPENSE
    method = Method.DEBIT_CARD
    date = dt.today()
    category = Category.FOOD
    description = "Este es un gasto necesario!"
    amount= 100000

    repository = InMemoryTransactionRepository()
    use_case = RegisterTransaction(repository)

    result = use_case.execute(
            amount=amount,
            transaction_type=transaction_type,
            method=method,
            date=date,
            category=category,
            description=description
            )

    assert result.id is not None
    assert result.id > 0
    assert result.amount == amount
    assert result.transaction_type == transaction_type
    assert result.method == method
    assert result.date == date
    assert result.category == category
    assert result.description == description


def test_execute_does_not_save_when_transaction_is_invalid():

    transaction_type = TransactionType.EXPENSE
    method = Method.DEBIT_CARD
    date = dt.today()
    category = Category.FOOD
    description = "Monto invalido"
    amount = 0

    repository = InMemoryTransactionRepository()
    use_case = RegisterTransaction(repository)

    with pytest.raises(InvalidAmountError):
        use_case.execute(
                amount=amount,
                transaction_type=transaction_type,
                method=method,
                date=date,
                category=category,
                description=description
                )

    assert repository._transactions == []
