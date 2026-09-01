from application.ports.objective_repository import ObjectiveRepository

class RemoveObjective:
    """
    Use case that deletes an objective by its id.

    Depends on the ObjectiveRepository port, not on a concrete
    implementation, so it can work with any adapter (in-memory,
    Postgres, etc.) that fulfills the contract.
    """

    def __init__(self, repository: ObjectiveRepository) -> None:
        """
        Args:
            repository: Concrete implementation of ObjectiveRepository
                used to delete the objective.
        """
        self._repository = repository

    def execute(self, id: int) -> bool:
        """
        Delete the objective with the given id.

        Returns:
            True if an objective was deleted, False if no objective
            with that id existed.
        """
        return self._repository.remove(id=id)