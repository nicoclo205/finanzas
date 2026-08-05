from abc import ABC, abstractmethod
from domain.transaction import Transaction

class TransactionRepository(ABC):

    @abstractmethod
    def save(self, transaction: Transaction) -> Transaction:
        """
        Persist a transaction and return it with its assigned id.                                         
        """
        ...
    
