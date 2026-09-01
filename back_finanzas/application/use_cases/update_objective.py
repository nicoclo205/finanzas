from application.ports.objective_repository import ObjectiveRepository
from domain.objective import Objective
from typing import Optional

class UpdateObjective:
    """
    Use case that updates an existing objective with new data.

    Depends on the ObjectiveRepository port, not on a concrete
    implementation, so it can work with any adapter (in-memory,
    Postgres, etc.) that fulfills the contract.
    """

    def __init__(self, repository: ObjectiveRepository) -> None:
        """
        Args:
            repository: Concrete implementation of ObjectiveRepository
                used to persist the updated objective.
        """
        self._repository = repository

    def execute(self, id: int, name, target_amount, created_date, target_date, saved_amount) -> Optional[Objective]:
        """
        Build an Objective from raw data and persist it in place of the
        objective with the given id.

        Returns:
            The updated Objective, or None if no objective with
            that id exists.
        """
        objective = Objective(
            name=name,
            target_amount=target_amount,
            created_date=created_date,
            target_date=target_date,
            saved_amount=saved_amount,
        )

        return self._repository.update(id=id, objective=objective)