from sqlalchemy.orm import Session

from application.ports.objective_repository import ObjectiveRepository
from domain.objective import Objective
from domain.transaction import Transaction, TransactionType, Method, Category
from infrastructure.db.models import TransactionModel, ObjectiveModel

from typing import Optional

class PostgresObjectiveRepository(ObjectiveRepository):

    def __init__(self, session: Session):

        self._session = session


    def save(self, objective: Objective) -> Objective:

        model = ObjectiveModel(
            name=objective.name,
            target_amount=objective.target_amount,
            created_date=objective.created_date,
            target_date=objective.target_date,
            saved_amount=objective.saved_amount
        )

        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)

        objective.objective_id = model.id
        return objective

    def list_all(self) -> list[Objective]:

        objectives = []
        consults = self._session.query(ObjectiveModel).all()

        for consult in consults: 

            objective = Objective(
                name=consult.name,
                target_amount=consult.target_amount,
                created_date=consult.created_date,
                target_date=consult.target_date,
                saved_amount=consult.saved_amount,
                objective_id=consult.id
            )

            objectives.append(objective)

        return objectives

    def get_by_id(self, objective_id: int) -> Optional[Objective]:

        consult = self._session.get(ObjectiveModel, objective_id)

        if consult is None:
            return None

        objective = Objective(
            name=consult.name,
            target_amount=consult.target_amount,
            created_date=consult.created_date,
            target_date=consult.target_date,
            saved_amount=consult.saved_amount,
            objective_id=consult.id
        )

        return objective

    def remove(self, objective_id: int) -> bool:

        consult = self._session.get(ObjectiveModel, objective_id)

        if consult is None:
            return False

        self._session.delete(consult)
        self._session.commit()

        return True

    def update(self, objective_id: int, objective: Objective) -> Optional[Objective]:

        consult = self._session.get(ObjectiveModel, objective_id)

        if consult is None:
            return None

        consult.name = objective.name
        consult.target_amount = objective.target_amount
        consult.created_date = objective.created_date
        consult.target_date = objective.target_date
        consult.saved_amount = objective.saved_amount

        self._session.commit()
        self._session.refresh(consult)

        updated_objective = Objective(
            name=consult.name,
            target_amount=consult.target_amount,
            created_date=consult.created_date,
            target_date=consult.target_date,
            saved_amount=consult.saved_amount,
            objective_id=consult.id
        )

        return updated_objective