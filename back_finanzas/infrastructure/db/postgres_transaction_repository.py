from sqlalchemy.orm import Session

from application.ports.transaction_repository import TransactionRepository
from domain.transaction import Transaction
from infrastructure.db.models import TransactionModel

class PostgresTransactionRepository(TransactionRepository):

    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, transaction: Transaction) -> Transaction:
        model = TransactionModel(
            amount=transaction.amount,
            transaction_type=transaction.transaction_type.value,
            method=transaction.method.value,
            date=transaction.date,
            category=transaction.category.value,
            description=transaction.description
        )

        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)

        transaction.id = model.id
        return transaction