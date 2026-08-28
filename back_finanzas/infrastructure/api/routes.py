from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from domain.exceptions import DomainError

from application.use_cases.register_transaction import RegisterTransaction
from application.use_cases.list_transactions import ListTransactions

from infrastructure.api.auth import verify_api_key
from infrastructure.db.session import get_db

from infrastructure.api.schemas import TransactionCreate, TransactionResponse
from infrastructure.db.postgres_transaction_repository import PostgresTransactionRepository

router = APIRouter()

@router.post(
    "/transactions",
    response_model=TransactionResponse,
    dependencies=[Depends(verify_api_key)]
)
def register_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    """
    Register a new transaction.

    Raises:
        HTTPException: 422 if the transaction data violates a domain rule.

    Returns:
        The persisted transaction, with its assigned id.
    """
    repository = PostgresTransactionRepository(session=db)
    use_case = RegisterTransaction(repository=repository)

    try:
        transaction = use_case.execute(
            amount=data.amount,
            transaction_type=data.transaction_type,
            method=data.method,
            date=data.date,
            category=data.category,
            description=data.description,
        )
    except DomainError as error:
        raise HTTPException(status_code=422, detail=str(error))

    return transaction


@router.get(
    "/transactions",
    response_model=list[TransactionResponse],
    dependencies=[Depends(verify_api_key)]
)
def get_transactions(db: Session = Depends(get_db)):
    """
    List all persisted transactions.

    Returns:
        The full list of transactions currently stored.
    """
    repository = PostgresTransactionRepository(session=db)
    use_case = ListTransactions(repository=repository)

    transactions_list = use_case.execute()

    return transactions_list