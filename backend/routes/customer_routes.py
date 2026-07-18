from flask import Blueprint, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models.customer import Customer
from models.account import BankAccount
from models.loan import LoanApplication
from models.support_ticket import SupportTicket

customer_bp = Blueprint(
    "customer",
    __name__
)

@customer_bp.route("/profile", methods=["GET"])
@jwt_required()
def customer_profile():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({
            "message": "Customer access required"
        }), 403

    customer = Customer.query.get(int(user_id))

    if not customer:
        return jsonify({
            "message": "Customer not found"
        }), 404

    return jsonify({
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "address": customer.address,
        "kyc_status": customer.kyc_status
    }), 200

@customer_bp.route("/transactions", methods=["GET"])
@jwt_required()
def customer_transactions():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({
            "message": "Customer access required"
        }), 403

    return jsonify({
        "message": "Customer transactions endpoint working"
    }), 200

@customer_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def customer_dashboard():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({
            "message": "Customer access required"
        }), 403

    accounts = BankAccount.query.filter_by(
        customer_id=int(user_id)
    ).all()

    loans = LoanApplication.query.filter_by(
        customer_id=int(user_id)
    ).all()

    tickets = SupportTicket.query.filter_by(
        customer_id=int(user_id)
    ).all()

    total_balance = sum(
        account.balance for account in accounts
    )

    return jsonify({
        "total_accounts": len(accounts),
        "total_balance": total_balance,
        "total_loans": len(loans),
        "total_tickets": len(tickets)
    })

@customer_bp.route("/dashboard-summary", methods=["GET"])
@jwt_required()
def customer_dashboard_summary():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    from models.transaction import Transaction
    from database.db import db

    accounts = BankAccount.query.filter_by(customer_id=int(user_id)).all()
    account_ids = [acc.id for acc in accounts]

    balance = sum(acc.balance for acc in accounts)
    total_deposits = 0.0
    total_withdrawals = 0.0

    if account_ids:
        total_deposits = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.account_id.in_(account_ids),
            Transaction.transaction_type == "Deposit"
        ).scalar() or 0.0

        total_withdrawals = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.account_id.in_(account_ids),
            Transaction.transaction_type == "Withdrawal"
        ).scalar() or 0.0

    total_loans = LoanApplication.query.filter_by(customer_id=int(user_id)).count()
    open_tickets = SupportTicket.query.filter_by(customer_id=int(user_id), status="Open").count()

    from datetime import datetime
    months_end = [
        ("Jan", datetime(2026, 1, 31, 23, 59, 59)),
        ("Feb", datetime(2026, 2, 28, 23, 59, 59)),
        ("Mar", datetime(2026, 3, 31, 23, 59, 59)),
        ("Apr", datetime(2026, 4, 30, 23, 59, 59)),
        ("May", datetime(2026, 5, 31, 23, 59, 59)),
        ("Jun", datetime(2026, 6, 30, 23, 59, 59)),
        ("Jul", datetime(2026, 7, 31, 23, 59, 59))
    ]
    
    chart_data = []
    if account_ids:
        all_txs = Transaction.query.filter(
            Transaction.account_id.in_(account_ids),
            Transaction.status == "Success"
        ).order_by(Transaction.created_at.asc()).all()
        
        for month_name, end_date in months_end:
            bal = 0.0
            for tx in all_txs:
                if tx.created_at <= end_date:
                    if tx.transaction_type in ["Deposit", "Loan Credit", "Transfer In"]:
                        bal += tx.amount
                    elif tx.transaction_type in ["Withdrawal", "Transfer Out"]:
                        bal -= tx.amount
            chart_data.append({
                "month": month_name,
                "balance": max(0.0, bal)
            })
    else:
        for month_name, _ in months_end:
            chart_data.append({
                "month": month_name,
                "balance": 0.0
            })

    return jsonify({
        "balance": balance,
        "total_deposits": total_deposits,
        "total_withdrawals": total_withdrawals,
        "total_loans": total_loans,
        "open_tickets": open_tickets,
        "chart_data": chart_data
    }), 200