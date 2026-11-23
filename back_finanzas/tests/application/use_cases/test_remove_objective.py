import pytest
from datetime import date as dt

from domain.objective import Objective
from domain.exceptions import ObjectiveHasFundsError
from application.use_cases.remove_objective import RemoveObjective
from tests.fakes.in_memory_objective_repository import InMemoryObjectiveRepository


def _objective(saved_amount: float) -> Objective:
    return Objective(
        name="Ahorros",
        target_amount=10000000,
        created_date=dt.today(),
        target_date=None,
        saved_amount=saved_amount,
    )


def test_remove_objective_without_funds():
    repository = InMemoryObjectiveRepository()
    use_case = RemoveObjective(repository=repository)
    objective = repository.save(_objective(saved_amount=0))

    result = use_case.execute(objective_id=objective.objective_id) # type: ignore

    assert result is True
    assert repository.list_all() == []


def test_remove_objective_not_found():
    repository = InMemoryObjectiveRepository()
    use_case = RemoveObjective(repository=repository)

    assert use_case.execute(objective_id=999) is False


def test_remove_objective_with_funds_is_rejected():
    repository = InMemoryObjectiveRepository()
    use_case = RemoveObjective(repository=repository)
    objective = repository.save(_objective(saved_amount=500000))

    with pytest.raises(ObjectiveHasFundsError):
        use_case.execute(objective_id=objective.objective_id) # type: ignore

    # La meta sigue existiendo, intacta.
    assert len(repository.list_all()) == 1
