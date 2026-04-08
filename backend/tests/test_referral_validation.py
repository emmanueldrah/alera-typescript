from pydantic import ValidationError
import pytest

from app.schemas import ReferralCreate


def test_referral_destination_must_differ_from_service_rendered():
    with pytest.raises(ValidationError) as exc_info:
        ReferralCreate(
            patient_id=1,
            referral_type="laboratory",
            to_department="Lab",
            reason="Routine blood work",
        )

    assert "The destination must be different from service rendered" in str(exc_info.value)


def test_referral_destination_allows_specific_target_within_service():
    referral = ReferralCreate(
        patient_id=1,
        referral_type="pharmacy",
        to_department="Clinical pharmacy",
        reason="Medication reconciliation",
    )

    assert referral.to_department == "Clinical pharmacy"
