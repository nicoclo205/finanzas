from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from domain.exceptions import DomainError

from application.use_cases.register_transaction import RegisterTransaction
from application.use_cases.list_transactions import ListTransactions
from application.use_cases.get_by_id import GetById
from application.use_cases.remove_transaction import RemoveTransaction

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

@router.get(
    "/transactions/{id}",
    response_model=TransactionResponse,
    dependencies=[Depends(verify_api_key)]
)
def get_transaction_by_id(id: int, db: Session = Depends(get_db)):
    """
    Fetch a single transaction by its id.

    Raises:
        HTTPException: 404 if no transaction with that id exists.

    Returns:
        The matching transaction.
    """
    repository = PostgresTransactionRepository(session=db)
    use_case = GetById(repository=repository)

    transaction = use_case.execute(id=id)

    if transaction is None:
        raise HTTPException(status_code=404, detail="Transacción no encontrada.")

    return transaction

@router.delete(
    "/transactions/{id}",
    dependencies=[Depends(verify_api_key)],
    status_code=204
)
def remove(id: int, db: Session = Depends(get_db)) -> None:
    repository = PostgresTransactionRepository(session=db)
    use_case = RemoveTransaction(repository=repository)

    deleted = use_case.execute(id=id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Transacción no encontrada.")
