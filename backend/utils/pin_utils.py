import re
from werkzeug.security import generate_password_hash

PIN_PATTERN = re.compile(r"^\d{4}$")
NUMERIC_PATTERN = re.compile(r"^\d*$")


def validate_transaction_pin(pin, confirm_pin=None):
    if pin is None:
        return False, "PIN must be exactly 4 digits."

    pin_str = str(pin)
    if not NUMERIC_PATTERN.match(pin_str):
        return False, "Only numeric values are allowed."

    if len(pin_str) != 4:
        return False, "PIN must be exactly 4 digits."

    if confirm_pin is not None and pin_str != str(confirm_pin):
        return False, "PINs do not match."

    return True, None


def hash_transaction_pin(pin):
    return generate_password_hash(str(pin))
