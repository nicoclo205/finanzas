from application.ports.objective_repository import ObjectiveRepository
from domain.objective import Objective
from typing import Optional

class GetObjectiveById:
    """
    Use case that fetches a single objective by its id.

    Depends on the ObjectiveRepository port, not on a concrete
    implementation, so it can work with any adapter (in-memory,
    Postgres, etc.) that fulfills the contract.
    """

    def __init__(self, repository: ObjectiveRepository) -> None:
        """
        Args:
            repository: Concrete implementation of ObjectiveRepository
                used to fetch the objective.
        """
        self._repository = repository

    def execute(self, id: int) -> Optional[Objective]:
        """
        Fetch the objective with the given id.

        Returns:
            The matching Objective, or None if no objective with
            that id exists.
        """
        return self._repository.get_by_id(id=id)