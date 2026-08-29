from application.ports.transaction_repository import TransactionRepository

class RemoveTransaction:

    def __init__(self, repository: TransactionRepository) -> None:
        self._repository = repository

    def execute(self, id):

        return self._repository.remove(id=id)