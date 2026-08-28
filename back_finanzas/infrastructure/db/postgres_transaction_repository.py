from sqlalchemy.orm import Session

from application.ports.transaction_repository import TransactionRepository
from domain.transaction import Transaction, TransactionType, Method, Category
from infrastructure.db.models import TransactionModel

from typing import Optional

class PostgresTransactionRepository(TransactionRepository):
    """
    Real implementation of TransactionRepository backed by Postgres,
    via SQLAlchemy. Translates between the domain Transaction (with
    Enums) and TransactionModel (the ORM row, with plain strings).
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, transaction: Transaction) -> Transaction:
        """
        Persist a transaction and return it with its assigned id.
        """
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

    def list_all(self) -> list[Transaction]:
        """
        Return every persisted transaction.
        """
        transactions = []
        consults = self._session.query(TransactionModel).all()

        for consult in consults:

            transaction = Transaction(
                amount=consult.amount,
                transaction_type=TransactionType(consult.transaction_type),
                method=Method(consult.method),
                date=consult.date,
                category=Category(consult.category),
                description=consult.description,
                id=consult.id
            )

            transactions.append(transaction)

        return transactions
        
    def get_by_id(self, id: int) -> Optional[Transaction]:
        """
        Return the transaction with the given id.
        """
        consult = self._session.get(TransactionModel, id)

        if consult is None:
            return None

        transaction = Transaction(
                amount=consult.amount,
                transaction_type=TransactionType(consult.transaction_type),
                method=Method(consult.method),
                date=consult.date,
                category=Category(consult.category),
                description=consult.description,
                id=consult.id
            )

        return transaction