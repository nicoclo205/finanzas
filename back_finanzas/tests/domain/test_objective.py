import pytest
from domain.objective import Objective
from domain.exceptions import InvalidAmountError, InvalidNameError
from datetime import date as dt

def test_valid_objective_submission():
    """An Objective built with valid data keeps all its fields as given."""

    name = "Ahorritos"
    target_amount = 1000000
    created_date = dt.today()
    saved_amount = 200000

    objective = Objective(
        name=name,
        target_amount=target_amount,
        target_date=None,
        created_date=created_date,
        saved_amount=saved_amount
    )

    assert objective.name == name
    assert objective.target_amount == target_amount
    assert objective.created_date == created_date
    assert objective.target_date is None
    assert objective.saved_amount == saved_amount

def test_zero_amount_raises_invalid_amount_error():
    """target_amount 0 is rejected — target_amount must be strictly positive."""
    with pytest.raises(InvalidAmountError):
        Objective(
        name="Ahorritos",
        target_amount=0,
        target_date=None,
        created_date=dt.today(),
        saved_amount=100000
        )


def test_valid_objective_with_no_target_amount_is_created():
    """target_amount is optional — None represents an open-ended savings bucket."""

    objective = Objective(
        name="Cuenta de ahorros",
        target_amount=None,
        created_date=dt.today(),
        target_date=None,
        saved_amount=0,
    )

    assert objective.target_amount is None


def test_empty_name_raises_invalid_name_error():
    """A blank (or whitespace-only) name is rejected."""
    with pytest.raises(InvalidNameError):
        Objective(
            name="   ",
            target_amount=1000000,
            created_date=dt.today(),
            target_date=None,
            saved_amount=0,
        )


def test_name_over_limit_raises_invalid_name_error():
    """A name longer than 100 characters is rejected."""
    with pytest.raises(InvalidNameError):
        Objective(
            name="a" * 101,
            target_amount=1000000,
            created_date=dt.today(),
            target_date=None,
            saved_amount=0,
        )


def test_negative_target_amount_raises_invalid_amount_error():
    """A negative target_amount is rejected."""
    with pytest.raises(InvalidAmountError):
        Objective(
            name="Ahorritos",
            target_amount=-100,
            created_date=dt.today(),
            target_date=None,
            saved_amount=0,
        )


def test_target_amount_over_limit_raises_invalid_amount_error():
    """A target_amount above the realistic limit (100,000,000) is rejected."""
    with pytest.raises(InvalidAmountError):
        Objective(
            name="Ahorritos",
            target_amount=100_000_001,
            created_date=dt.today(),
            target_date=None,
            saved_amount=0,
        )


def test_negative_saved_amount_raises_invalid_amount_error():
    """A negative saved_amount is rejected."""
    with pytest.raises(InvalidAmountError):
        Objective(
            name="Ahorritos",
            target_amount=1000000,
            created_date=dt.today(),
            target_date=None,
            saved_amount=-100,
        )

