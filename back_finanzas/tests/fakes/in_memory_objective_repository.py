from application.ports.objective_repository import ObjectiveRepository
from domain.objective import Objective
from typing import Optional

class InMemoryObjectiveRepository(ObjectiveRepository):
    """
    In-memory fake implementation of ObjectiveRepository, used to test
    use cases without depending on Postgres.
    """

    def __init__(self) -> None:
        """
        Starts with an empty list of objectives and id autoincrement at 1.
        """
        self._objectives = []
        self._next_id = 1

    def save(self, objective: Objective) -> Objective:
        """
        Simulates a bd with a list where the objective objects are created with an increasing id
        """
        objective.objective_id = self._next_id
        self._next_id += 1

        self._objectives.append(objective)

        return objective

    def list_all(self) -> list[Objective]:
        """
        Simulates a get option where the list of objectives is fetched
        """
        return list(self._objectives)

    def get_by_id(self, objective_id: int) -> Optional[Objective]:
        """
        Simulates a get option where an specific objective is fetched by its id
        """
        return next((o for o in self._objectives if o.objective_id == objective_id), None)

    def remove(self, objective_id: int) -> bool:
        """
        Simulates an objective being deleted using an id
        """
        consult = next((o for o in self._objectives if o.objective_id == objective_id), None)

        if consult is None:
            return False

        self._objectives.remove(consult)
        return True

    def update(self, objective_id: int, objective: Objective) -> Optional[Objective]:
        """
        Simulates an objective being updated using an id
        """
        consult = next((o for o in self._objectives if o.objective_id == objective_id), None)

        if consult is None:
            return None

        consult.name = objective.name
        consult.target_amount = objective.target_amount
        consult.target_date = objective.target_date
        consult.saved_amount = objective.saved_amount

        return consult