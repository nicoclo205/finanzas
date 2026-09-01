from abc import ABC, abstractmethod
from typing import Optional
from domain.objective import Objective

class ObjectiveRepository(ABC):
    """
    Port defining the persistence contract for objectives and saving purposes.

    Concrete adapters (in-memory, Postgres, etc.) implement this
    interface so the application layer never depends on a specific
    storage technology.
    """
    @abstractmethod
    def save(self, objective: Objective) -> Objective:  
        """
        Persist an objective and return it with its assigned id.                                         
        """
        ...

    @abstractmethod
    def list_all(self) -> list[Objective]:
        """
        Returns the list of objectives setted.
        """
        ...

    @abstractmethod
    def get_by_id(self, id: int) -> Optional[Objective]:
        """
        Return the objective filtered by id.
        """
        ...

    @abstractmethod
    def remove(self, id: int) -> bool:
        """
        Deletes an objective selected by an id.
        """
        ...

    @abstractmethod
    def update(self, id: int, objective: Objective) -> Optional[Objective]:
        """
        Updates an objective selected by an id, returning the updated
        objective, or None if no objective with that id exists.
        """
        ...