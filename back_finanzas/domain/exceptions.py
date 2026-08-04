class DomainError(Exception): 
    pass

class InvalidAmountError(DomainError):
    pass

class InvalidDescriptionError(DomainError):
    pass