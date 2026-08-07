from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from backend.database.db import db
from backend.models.account import BankAccount
from backend.models.transaction import Transaction
from backend.models.customer import Customer
from backend.models.bank_settings import BankSettings
from backend.utils.pin_utils import validate_transaction_pin, hash_transaction_pin

account_bp = Blueprint(
    "account",
    __name__
)

@account_bp.route("/test")
def test_account():

    return {
        "message": "Account routes working"
    }

@account_bp.route("/min-deposit", methods=["GET"])
def get_min_deposit():
    settings = BankSettings.get_settings()
    return jsonify({
        "minimum_initial_deposit": settings.minimum_initial_deposit
    }), 200

import random


@account_bp.route("/create", methods=["POST"])
@jwt_required()
def create_account():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({
            "message": "Customer access required"
        }), 403

    customer = Customer.query.get(int(user_id))
    if not customer:
        return jsonify({"message": "Customer profile not found"}), 404

    if customer.kyc_status != "Approved":
        return jsonify({"message": "KYC approval is required to open a bank account"}), 400

    if not customer.is_active:
        return jsonify({"message": "Customer account is inactive"}), 400

    data = request.get_json() or {}
    account_type = data.get("account_type")
    
    if not account_type:
        return jsonify({"message": "account_type is required"}), 400

    if account_type not in ["Savings", "Current"]:
        return jsonify({"message": "Invalid account type. Must be Savings or Current"}), 400

    pin = data.get("transaction_pin")
    confirm_pin = data.get("confirm_transaction_pin")

    is_valid_pin, pin_error = validate_transaction_pin(pin, confirm_pin)
    if not is_valid_pin:
        return jsonify({"message": pin_error}), 400

    try:
        initial_balance = float(data.get("initial_balance") or 0.0)
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid initial balance format"}), 400

    settings = BankSettings.get_settings()
    min_deposit = settings.minimum_initial_deposit

    if initial_balance < min_deposit:
        formatted_min = int(min_deposit) if min_deposit.is_integer() else min_deposit
        return jsonify({"message": f"Initial deposit must be at least ₹{formatted_min}."}), 400

    # Generate unique 12-digit account number
    while True:
        account_number = "".join([str(random.randint(0, 9)) for _ in range(12)])
        exists = BankAccount.query.filter_by(account_number=account_number).first()
        if not exists:
            break

    hashed_pin = hash_transaction_pin(pin)

    account = BankAccount(
        customer_id=int(user_id),
        account_number=account_number,
        account_type=account_type,
        balance=initial_balance,
        status="Active",
        transaction_pin_hash=hashed_pin
    )

    db.session.add(account)
    db.session.flush()

    if initial_balance > 0:
        transaction = Transaction(
            from_account_id=account.id,
            to_account_id=account.id,
            account_id=account.id,
            transaction_type="Initial Deposit",
            amount=initial_balance,
            status="Completed",
            description="Initial deposit during account creation."
        )
        db.session.add(transaction)

    db.session.commit()

    return jsonify({
        "message": "Your account has been created successfully. Your transaction PIN has been set successfully.",
        "account_number": account_number
    }), 201

@account_bp.route("/my-accounts", methods=["GET"])
@jwt_required()
def my_accounts():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({
            "message": "Customer access required"
        }), 403

    accounts = BankAccount.query.filter_by(
        customer_id=int(user_id)
    ).all()

    result = []

    for account in accounts:
        result.append({
            "id": account.id,
            "account_number": account.account_number,
            "account_type": account.account_type,
            "balance": account.balance,
            "status": account.status
        })

    return jsonify(result), 200

@account_bp.route("/delete/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_account(id):
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    account = BankAccount.query.get(id)
    if not account:
        return jsonify({"message": "Account not found"}), 404

    if account.customer_id != int(user_id):
        return jsonify({"message": "Unauthorized"}), 403

    if account.status == "Frozen":
        return jsonify({"message": "Cannot delete a frozen account"}), 400

    if account.balance != 0:
        return jsonify({"message": "Cannot delete account with a non-zero balance"}), 400

    db.session.delete(account)
    db.session.commit()

    return jsonify({"message": "Account deleted successfully"}), 200