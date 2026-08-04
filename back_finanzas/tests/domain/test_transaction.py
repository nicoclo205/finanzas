import pytest
from domain.transaction import Transaction, TransactionType, Method, Category
from domain.exceptions import InvalidAmountError, InvalidDescriptionError
from datetime import date as dt

def test_valid_transaction_is_created():

    transaction_type = TransactionType.EXPENSE
    method = Method.DEBIT_CARD
    date = dt.today()
    category = Category.FOOD
    description = "Este es un gasto necesario!"
    amount= 100000

    transaction = Transaction(
        amount=amount,
        transaction_type=transaction_type,
        method=method,
        date=date,
        category=category,
        description=description,
    )

    assert transaction.amount == amount
    assert transaction.transaction_type == transaction_type
    assert transaction.method == method
    assert transaction.date == date
    assert transaction.category == category
    assert transaction.description == description


def test_zero_amount_raises_invalid_amount_error():
    with pytest.raises(InvalidAmountError):
        Transaction(
            amount=0,
            transaction_type=TransactionType.EXPENSE,
            method=Method.DEBIT_CARD,
            date=dt.today(),
            category=Category.FOOD,
            description="Gasto de prueba",
        )


def test_negative_amount_raises_invalid_amount_error():
    with pytest.raises(InvalidAmountError):
        Transaction(
            amount=-100,
            transaction_type=TransactionType.EXPENSE,
            method=Method.DEBIT_CARD,
            date=dt.today(),
            category=Category.FOOD,
            description="Gasto de prueba",
        )


def test_amount_over_limit_raises_invalid_amount_error():
    with pytest.raises(InvalidAmountError):
        Transaction(
            amount=100_000_001,
            transaction_type=TransactionType.EXPENSE,
            method=Method.DEBIT_CARD,
            date=dt.today(),
            category=Category.FOOD,
            description="Gasto de prueba",
        )


def test_description_too_long_raises_invalid_description_error():
    with pytest.raises(InvalidDescriptionError):
        Transaction(
            amount=100,
            transaction_type=TransactionType.EXPENSE,
            method=Method.DEBIT_CARD,
            date=dt.today(),
            category=Category.FOOD,
            description="a" * 101,
        )
    

    