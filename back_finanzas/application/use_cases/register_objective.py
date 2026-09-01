from domain.objective import Objective
from application.ports.objective_repository import ObjectiveRepository

class RegisterObjective:
    """
    Use case that registers a new objective.

    Depends on the ObjectiveRepository port, not on a concrete
    implementation, so it can work with any adapter (in-memory,
    Postgres, etc.) that fulfills the contract.
    """

    def __init__(self, repository: ObjectiveRepository) -> None:
        """
        Args:
            repository: Concrete implementation of ObjectiveRepository
                used to persist the objective.
        """
        self._repository = repository

    def execute(self, name, target_amount, created_date, target_date, saved_amount) -> Objective:
        """
        Build an Objective from raw data and persist it.

        Returns:
            The persisted Objective, with its id assigned by the repository.
        """
        objective = Objective(
            name=name,
            target_amount=target_amount,
            created_date=created_date,
            target_date=target_date,
            saved_amount=saved_amount,
        )

        return self._repository.save(objective=objective)


