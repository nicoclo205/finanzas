from domain.transaction import Transaction, TransactionType, Method, Category
from datetime import date as dt
from tests.fakes.in_memory_transaction_repository import InMemoryTransactionRepository
from application.use_cases.update_transaction import UpdateTransaction

def test_update_transaction():

        transaction = Transaction(
        amount=10000,
        transaction_type=TransactionType.EXPENSE,
        method=Method.CASH,
        date=dt.today(),
        category=Category.OUTINGS,
        description="Gasto para pasarla bien!"
        )

        repository = InMemoryTransactionRepository()
        use_case = UpdateTransaction(repository=repository)

        repository.save(transaction=transaction)

        result = use_case.execute(
                id=1,
                amount=30000,
                transaction_type=TransactionType.INCOME,
                method=Method.CREDIT_CARD,
                date=dt.today(),
                category=Category.OUTINGS,
                description="Ingreso para pasarla bien!"
                ) 

        assert result is not None
        assert result.id == 1
        assert result.amount == 30000
        assert result.transaction_type == TransactionType.INCOME
        assert result.method == Method.CREDIT_CARD
        assert result.category == Category.OUTINGS
        assert result.date == dt.today()
        assert result.description == "Ingreso para pasarla bien!"


def test_update_transaction_not_found():

        repository = InMemoryTransactionRepository()
        use_case = UpdateTransaction(repository=repository)

        result = use_case.execute(
                id=1,
                amount=30000,
                transaction_type=TransactionType.INCOME,
                method=Method.CREDIT_CARD,
                date=dt.today(),
                category=Category.OUTINGS,
                description="Ingreso para pasarla bien!"
                )

        assert result is None
