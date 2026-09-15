class DomainError(Exception):
    """
    Base class for every error raised by the domain layer.

    Lets upper layers (application, infrastructure) catch domain
    violations specifically, instead of generic exceptions.
    """
    pass

class InvalidAmountError(DomainError):
    """
    Raised when a monetary amount violates a domain rule (not positive,
    or above the realistic limit).
    """
    pass

class InvalidDescriptionError(DomainError):
    """
    Raised when a description is too long.
    """
    pass

class InvalidNameError(DomainError):
    """
    Raised when a name is empty/blank or too long.
    """
    pass

class ObjectiveNotFoundError(DomainError):
    """
    Raised when no Objective exists for the given id.
    """
    pass