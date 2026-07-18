from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from database.db import db
from models.account import BankAccount
from models.transaction import Transaction
from models.customer import Customer

account_bp = Blueprint(
    "account",
    __name__
)

@account_bp.route("/test")
def test_account():

    return {
        "message": "Account routes working"
    }

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

    try:
        initial_balance = float(data.get("initial_balance") or 0.0)
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid initial balance format"}), 400

    if initial_balance < 0:
        return jsonify({"message": "Initial balance cannot be negative"}), 400

    # Generate unique 12-digit account number
    while True:
        account_number = "".join([str(random.randint(0, 9)) for _ in range(12)])
        exists = BankAccount.query.filter_by(account_number=account_number).first()
        if not exists:
            break

    account = BankAccount(
        customer_id=int(user_id),
        account_number=account_number,
        account_type=account_type,
        balance=initial_balance,
        status="Active"
    )

    db.session.add(account)
    db.session.flush()

    if initial_balance > 0:
        transaction = Transaction(
            from_account_id=account.id,
            to_account_id=account.id,
            account_id=account.id,
            transaction_type="Deposit",
            amount=initial_balance,
            status="Success"
        )
        db.session.add(transaction)

    db.session.commit()

    return jsonify({
        "message": "Account created successfully",
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