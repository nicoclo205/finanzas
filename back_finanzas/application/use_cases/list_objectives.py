from application.ports.objective_repository import ObjectiveRepository
from domain.objective import Objective

class ListObjectives:
    """
    Use case that fetches all objectives.

    Depends on the ObjectiveRepository port, not on a concrete
    implementation, so it can work with any adapter (in-memory,
    Postgres, etc.) that fulfills the contract.
    """

    def __init__(self, repository: ObjectiveRepository) -> None:
        """
        Args:
            repository: Concrete implementation of ObjectiveRepository
                used to fetch the objectives.
        """
        self._repository = repository


    def execute(self) -> list[Objective]:
        """
        Fetches all the objectives.

        Returns:
            The persisted Objectives.
        """
        return self._repository.list_all()