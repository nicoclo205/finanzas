from application.ports.objective_repository import ObjectiveRepository
from domain.exceptions import ObjectiveHasFundsError

class RemoveObjective:
    """
    Use case that deletes an objective by its id.

    Depends on the ObjectiveRepository port, not on a concrete
    implementation, so it can work with any adapter (in-memory,
    Postgres, etc.) that fulfills the contract.

    Refuses to delete an objective that still holds saved money: that
    money would otherwise vanish from the balance (it already left the
    available balance when it was assigned). The caller must withdraw it
    first, which turns it back into income.
    """

    def __init__(self, repository: ObjectiveRepository) -> None:
        """
        Args:
            repository: Concrete implementation of ObjectiveRepository
                used to delete the objective.
        """
        self._repository = repository

    def execute(self, objective_id: int) -> bool:
        """
        Delete the objective with the given id.

        Returns:
            True if an objective was deleted, False if no objective
            with that id existed.

        Raises:
            ObjectiveHasFundsError: if the objective still has
                saved_amount > 0.
        """
        objective = self._repository.get_by_id(objective_id=objective_id)

        if objective is None:
            return False

        if objective.saved_amount > 0:
            raise ObjectiveHasFundsError(
                "La meta todavía tiene plata apartada: retírala antes de borrarla."
            )

        return self._repository.remove(objective_id=objective_id)
