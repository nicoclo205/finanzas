from sqlalchemy.orm import Session

from application.ports.transaction_repository import TransactionRepository
from domain.transaction import Transaction, TransactionType, Method, Category
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

    def list_all(self) -> list[Transaction]:

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
        
        
