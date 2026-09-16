import pytest
from domain.objective import Objective
from application.use_cases.assign_to_objective import AssignToObjective
from domain.transaction import TransactionType, Category, Method
from domain.exceptions import ObjectiveNotFoundError, InvalidAmountError
from tests.fakes.in_memory_objective_repository import InMemoryObjectiveRepository
from tests.fakes.in_memory_transaction_repository import InMemoryTransactionRepository
from datetime import date as dt

def test_valid_objective_assignation():

    transaction_repository = InMemoryTransactionRepository()
    objective_repository = InMemoryObjectiveRepository()
    use_case = AssignToObjective(
        objective_repository=objective_repository, 
        transaction_repository=transaction_repository
        )

    objective = Objective(
        name="Ahorros",
        target_amount=10000000,
        created_date=dt.today(),
        target_date=None,
        saved_amount=0
    )

    objective_repository.save(objective=objective)

    result = use_case.execute(
        amount=1000000,
        method=Method.DEBIT_CARD,
        date=dt.today(),
        description="Necesario",
        objective_id=objective.objective_id
    )

    assert result is not None
    assert result.saved_amount == 1000000
    assert result.name == "Ahorros"
    assert result.target_amount == 10000000

    assert len(transaction_repository._transactions) == 1
    saved_transaction = transaction_repository._transactions[0]
    assert saved_transaction.amount == 1000000
    assert saved_transaction.transaction_type == TransactionType.EXPENSE
    assert saved_transaction.category == Category.SAVINGS
    assert saved_transaction.method == Method.DEBIT_CARD
    assert saved_transaction.description == "Necesario"
    assert saved_transaction.objective_id == objective.objective_id


def test_execute_raises_when_objective_does_not_exist():

    transaction_repository = InMemoryTransactionRepository()
    objective_repository = InMemoryObjectiveRepository()
    use_case = AssignToObjective(objective_repository=objective_repository, transaction_repository=transaction_repository)

    with pytest.raises(ObjectiveNotFoundError):
        use_case.execute(
            amount=1000000,
            method=Method.DEBIT_CARD,
            date=dt.today(),
            description="Necesario",
            objective_id=999
        )

    assert transaction_repository._transactions == []


def test_execute_does_not_save_when_amount_is_invalid():

    transaction_repository = InMemoryTransactionRepository()
    objective_repository = InMemoryObjectiveRepository()
    use_case = AssignToObjective(objective_repository=objective_repository, transaction_repository=transaction_repository)

    objective = Objective(
        name="Ahorros",
        target_amount=10000000,
        created_date=dt.today(),
        target_date=None,
        saved_amount=0
    )

    objective_repository.save(objective=objective)

    with pytest.raises(InvalidAmountError):
        use_case.execute(
            amount=0,
            method=Method.DEBIT_CARD,
            date=dt.today(),
            description="Monto invalido",
            objective_id=objective.objective_id
        )

    assert transaction_repository._transactions == []

    unchanged_objective = objective_repository.get_by_id(objective_id=objective.objective_id) # type: ignore
    assert unchanged_objective is not None
    assert unchanged_objective.saved_amount == 0

