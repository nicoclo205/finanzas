from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from domain.exceptions import DomainError, ObjectiveNotFoundError

from application.use_cases.register_transaction import RegisterTransaction
from application.use_cases.list_transactions import ListTransactions
from application.use_cases.get_by_id import GetById
from application.use_cases.remove_transaction import RemoveTransaction
from application.use_cases.update_transaction import UpdateTransaction

from application.use_cases.register_objective import RegisterObjective
from application.use_cases.list_objectives import ListObjectives
from application.use_cases.get_objective_by_id import GetObjectiveById
from application.use_cases.remove_objective import RemoveObjective
from application.use_cases.update_objective import UpdateObjective
from application.use_cases.assign_to_objective import AssignToObjective
from application.use_cases.withdraw_from_objective import WithdrawFromObjective

from infrastructure.api.auth import verify_api_key
from infrastructure.db.session import get_db

from infrastructure.api.schemas import TransactionCreate, TransactionResponse
from infrastructure.api.schemas import ObjectiveCreate, ObjectiveResponse, ObjectiveMovementRequest

from infrastructure.db.postgres_transaction_repository import PostgresTransactionRepository
from infrastructure.db.postgres_objective_repository import PostgresObjectiveRepository

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
def remove(id: int, db: Session = Depends(get_db)):
    """
    Delete a single transaction by its id.

    Raises:
        HTTPException: 404 if no transaction with that id exists.
    """
    repository = PostgresTransactionRepository(session=db)
    use_case = RemoveTransaction(repository=repository)

    deleted = use_case.execute(id=id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Transacción no encontrada.")


@router.put(
    "/transactions/{id}",
    response_model=TransactionResponse,
    dependencies=[Depends(verify_api_key)]
)
def update(id: int, data: TransactionCreate, db: Session = Depends(get_db)):
    """
    Replace a transaction's data by its id.

    Raises:
        HTTPException: 422 if the new data violates a domain rule,
            404 if no transaction with that id exists.

    Returns:
        The updated transaction.
    """
    repository = PostgresTransactionRepository(session=db)
    use_case = UpdateTransaction(repository=repository)

    try:
        updated = use_case.execute(id=id,
                                   amount=data.amount,
                                   transaction_type=data.transaction_type,
                                   method=data.method,
                                   date=data.date,
                                   category=data.category,
                                   description=data.description
                                )
    except DomainError as error:
        raise HTTPException(status_code=422, detail=str(error))

    if updated is None:
        raise HTTPException(status_code=404, detail="Transacción no encontrada.")

    return updated


@router.post(
    "/objectives",
    response_model=ObjectiveResponse,
    dependencies=[Depends(verify_api_key)]
)
def register_objective(data: ObjectiveCreate, db: Session = Depends(get_db)):

    repository = PostgresObjectiveRepository(session=db)
    use_case = RegisterObjective(repository=repository)

    try:
        objective = use_case.execute(
            name=data.name,
            target_amount=data.target_amount,
            created_date=data.created_date,
            target_date=data.target_date,
            saved_amount=0
        )
    except DomainError as error:
        raise HTTPException(status_code=422, detail=str(error))


    return objective

@router.get(
    "/objectives",
    response_model=list[ObjectiveResponse],
    dependencies=[Depends(verify_api_key)]
)
def list_objectives(db: Session = Depends(get_db)):

    repository = PostgresObjectiveRepository(session=db)
    use_case = ListObjectives(repository=repository)

    objective_list = use_case.execute()

    return objective_list


@router.get(
        "/objectives/{id}",
        response_model=ObjectiveResponse,
        dependencies=[Depends(verify_api_key)]
)
def get_objective_by_id(id: int, db: Session = Depends(get_db)):

    repository = PostgresObjectiveRepository(session=db)
    use_case = GetObjectiveById(repository=repository)

    objective = use_case.execute(objective_id=id)

    if objective is None:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")

    return objective

@router.delete(
        "/objectives/{id}",
        dependencies=[Depends(verify_api_key)],
        status_code=204
)
def remove_objective(id: int, db: Session = Depends(get_db)):

    repository = PostgresObjectiveRepository(session=db)
    use_case = RemoveObjective(repository=repository)

    deleted = use_case.execute(objective_id=id)

    if deleted is False:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")


@router.put(
    "/objectives/{id}",
    response_model=ObjectiveResponse,
    dependencies=[Depends(verify_api_key)]
)
def update_objective(id: int, data: ObjectiveCreate, db: Session = Depends(get_db)):

    repository = PostgresObjectiveRepository(session=db)
    use_case = UpdateObjective(repository=repository)

    existing_objective = GetObjectiveById(repository=repository).execute(objective_id=id)

    if existing_objective is None:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")

    updated_objective = use_case.execute(
        objective_id=id,
        name=data.name,
        target_amount=data.target_amount,
        created_date=data.created_date,
        target_date=data.target_date,
        saved_amount=existing_objective.saved_amount
    )

    if updated_objective is None:
        raise HTTPException(status_code=404, detail="Meta no encontrada.")

    return updated_objective

@router.post(
    "/objectives/{id}/assign",
    response_model=ObjectiveResponse,
    dependencies=[Depends(verify_api_key)]
)
def assign_to_objective(transaction_data: ObjectiveMovementRequest, id: int, db: Session = Depends(get_db)):

    objective_repository = PostgresObjectiveRepository(session=db)
    transaction_repository = PostgresTransactionRepository(session=db)
    use_case = AssignToObjective(
        objective_repository=objective_repository,
        transaction_repository=transaction_repository
        )

    try:
        objective = use_case.execute(
            amount=transaction_data.amount,
            method=transaction_data.method,
            date=transaction_data.date,
            description=transaction_data.description,
            objective_id=id
        )

    except ObjectiveNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except DomainError as error:
        raise HTTPException(status_code=422, detail=str(error))

    return objective

@router.post(
    "/objectives/{id}/withdraw",
    response_model=ObjectiveResponse,
    dependencies=[Depends(verify_api_key)]
)
def withdraw_from_objective(transaction_data: ObjectiveMovementRequest, id: int, db: Session = Depends(get_db)):

    objective_repository = PostgresObjectiveRepository(session=db)
    transaction_repository = PostgresTransactionRepository(session=db)
    use_case = WithdrawFromObjective(
        objective_repository=objective_repository,
        transaction_repository=transaction_repository
        )

    try:
        objective = use_case.execute(
            amount=transaction_data.amount,
            method=transaction_data.method,
            date=transaction_data.date,
            description=transaction_data.description,
            objective_id=id
        )

    except ObjectiveNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except DomainError as error:
        raise HTTPException(status_code=422, detail=str(error))

    return objective