from application.ports.objective_repository import ObjectiveRepository
from application.ports.transaction_repository import TransactionRepository
from domain.objective import Objective
from domain.transaction import Transaction, Category, TransactionType
from domain.exceptions import ObjectiveNotFoundError
from typing import Optional

class AssignToObjective:

    def __init__(
            self,
            objective_repository: ObjectiveRepository,
            transaction_repository: TransactionRepository
            ) -> None:

        self._objective_repository = objective_repository
        self._transaction_repository = transaction_repository

    def execute(self, amount, method, date, description, objective_id) -> Optional[Objective]:

        objective = self._objective_repository.get_by_id(objective_id=objective_id)

        if objective is None:
            raise ObjectiveNotFoundError(f"No existe una meta con id {objective_id}.")

        transaction = Transaction(
            amount=amount,
            method=method,
            transaction_type=TransactionType.EXPENSE,
            date=date,
            category=Category.SAVINGS,
            description=description,
            objective_id=objective_id
        )

        self._transaction_repository.save(transaction=transaction)

        updated_objective = Objective(
            name=objective.name,
            target_amount=objective.target_amount,
            created_date=objective.created_date,
            target_date=objective.target_date,
            saved_amount=objective.saved_amount + transaction.amount,
        )

        return self._objective_repository.update(objective_id=objective_id, objective=updated_objective)