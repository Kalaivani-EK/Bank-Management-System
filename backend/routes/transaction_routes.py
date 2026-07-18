from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from database.db import db
from models.account import BankAccount
from models.transaction import Transaction

transaction_bp = Blueprint(
    "transaction",
    __name__
)

@transaction_bp.route("/test")
def test_transaction():

    return {
        "message": "Transaction routes working"
    }

@transaction_bp.route("/deposit", methods=["POST"])
@jwt_required()
def deposit():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    data = request.get_json()
    account_id = data.get("account_id")
    amount = data.get("amount")

    if account_id is None or amount is None:
        return jsonify({"message": "account_id and amount are required"}), 400

    try:
        amount = float(amount)
    except ValueError:
        return jsonify({"message": "Invalid amount format"}), 400

    if amount <= 0:
        return jsonify({"message": "Amount must be greater than zero"}), 400

    account = BankAccount.query.get(account_id)
    if not account:
        return jsonify({"message": "Account not found"}), 404

    # Verify account belongs to logged-in customer
    if account.customer_id != int(user_id):
        return jsonify({"message": "Unauthorized: You do not own this account"}), 403

    # Verify status
    if account.status == "Frozen":
        return jsonify({"message": "Account is Frozen"}), 400
    if account.status == "Closed":
        return jsonify({"message": "Account is Closed"}), 400

    account.balance += amount

    transaction = Transaction(
        from_account_id=account.id,
        to_account_id=account.id,
        account_id=account.id,
        transaction_type="Deposit",
        amount=amount,
        status="Success"
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({"message": "Deposit successful"}), 200

@transaction_bp.route("/withdraw", methods=["POST"])
@jwt_required()
def withdraw():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    data = request.get_json()
    account_id = data.get("account_id")
    amount = data.get("amount")

    if account_id is None or amount is None:
        return jsonify({"message": "account_id and amount are required"}), 400

    try:
        amount = float(amount)
    except ValueError:
        return jsonify({"message": "Invalid amount format"}), 400

    if amount <= 0:
        return jsonify({"message": "Amount must be greater than zero"}), 400

    account = BankAccount.query.get(account_id)
    if not account:
        return jsonify({"message": "Account not found"}), 404

    # Verify account belongs to logged-in customer
    if account.customer_id != int(user_id):
        return jsonify({"message": "Unauthorized: You do not own this account"}), 403

    # Verify status
    if account.status == "Frozen":
        return jsonify({"message": "Account is Frozen"}), 400
    if account.status == "Closed":
        return jsonify({"message": "Account is Closed"}), 400

    # Check sufficient balance
    if account.balance < amount:
        return jsonify({"message": "Insufficient balance"}), 400

    account.balance -= amount

    transaction = Transaction(
        from_account_id=account.id,
        to_account_id=account.id,
        account_id=account.id,
        transaction_type="Withdrawal",
        amount=amount,
        status="Success"
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({"message": "Withdrawal successful"}), 200

@transaction_bp.route("/transfer", methods=["POST"])
@jwt_required()
def transfer():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    data = request.get_json()
    sender_account_id = data.get("sender_account_id")
    receiver_account_number = data.get("receiver_account_number")
    amount = data.get("amount")

    if sender_account_id is None or not receiver_account_number or amount is None:
        return jsonify({"message": "sender_account_id, receiver_account_number, and amount are required"}), 400

    try:
        amount = float(amount)
    except ValueError:
        return jsonify({"message": "Invalid amount format"}), 400

    if amount <= 0:
        return jsonify({"message": "Amount must be greater than zero"}), 400

    from_account = BankAccount.query.get(sender_account_id)
    if not from_account:
        return jsonify({"message": "Sender account not found"}), 404

    # Verify sender owns account
    if from_account.customer_id != int(user_id):
        return jsonify({"message": "Unauthorized: You do not own this account"}), 403

    # Verify receiver exists
    receiver_account = BankAccount.query.filter_by(account_number=str(receiver_account_number)).first()
    if not receiver_account:
        return jsonify({"message": "Receiver account not found"}), 404

    # Verify sender and receiver are not same account
    if from_account.id == receiver_account.id:
        return jsonify({"message": "Cannot transfer to the same account"}), 400

    # Verify status on both accounts
    if from_account.status == "Frozen":
        return jsonify({"message": "Sender account is Frozen"}), 400
    if from_account.status == "Closed":
        return jsonify({"message": "Sender account is Closed"}), 400

    if receiver_account.status == "Frozen":
        return jsonify({"message": "Receiver account is Frozen"}), 400
    if receiver_account.status == "Closed":
        return jsonify({"message": "Receiver account is Closed"}), 400

    # Verify sufficient balance
    if from_account.balance < amount:
        return jsonify({"message": "Insufficient balance"}), 400

    from_account.balance -= amount
    receiver_account.balance += amount

    # Create two transaction records
    txn_out = Transaction(
        from_account_id=from_account.id,
        to_account_id=receiver_account.id,
        account_id=from_account.id,
        transaction_type="Transfer Out",
        amount=amount,
        status="Success"
    )

    txn_in = Transaction(
        from_account_id=from_account.id,
        to_account_id=receiver_account.id,
        account_id=receiver_account.id,
        transaction_type="Transfer In",
        amount=amount,
        status="Success"
    )

    db.session.add(txn_out)
    db.session.add(txn_in)
    db.session.commit()

    return jsonify({"message": "Transfer successful"}), 200

@transaction_bp.route("/history", methods=["GET"])
@jwt_required()
def transaction_history():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    accounts = BankAccount.query.filter_by(customer_id=int(user_id)).all()
    account_ids = [account.id for account in accounts]

    query = Transaction.query.filter(Transaction.account_id.in_(account_ids))

    tx_type = request.args.get("type")
    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    if tx_type:
        query = query.filter(Transaction.transaction_type == tx_type)

    from datetime import datetime
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            query = query.filter(Transaction.created_at >= start_date)
        except ValueError:
            pass

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str + " 23:59:59", "%Y-%m-%d %H:%M:%S")
            query = query.filter(Transaction.created_at <= end_date)
        except ValueError:
            pass

    query = query.order_by(Transaction.created_at.desc())

    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
    except ValueError:
        page = 1
        per_page = 10

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    result = []
    for txn in paginated.items:
        result.append({
            "id": txn.id,
            "from_account_id": txn.from_account_id,
            "to_account_id": txn.to_account_id,
            "account_id": txn.account_id,
            "transaction_type": txn.transaction_type,
            "amount": txn.amount,
            "status": txn.status,
            "created_at": txn.created_at.strftime("%Y-%m-%d %H:%M:%S") if txn.created_at else None
        })

    return jsonify({
        "transactions": result,
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages
    }), 200

@transaction_bp.route("/summary", methods=["GET"])
@jwt_required()
def transaction_summary():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    accounts = BankAccount.query.filter_by(customer_id=int(user_id)).all()
    account_ids = [account.id for account in accounts]

    if not account_ids:
        return jsonify({
            "total_deposits": 0,
            "total_withdrawals": 0,
            "total_transfers": 0
        }), 200

    deposits = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.account_id.in_(account_ids), Transaction.transaction_type == "Deposit")\
        .scalar() or 0.0

    withdrawals = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.account_id.in_(account_ids), Transaction.transaction_type == "Withdrawal")\
        .scalar() or 0.0

    transfers = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.account_id.in_(account_ids), Transaction.transaction_type.in_(["Transfer Out", "Transfer In"]))\
        .scalar() or 0.0

    return jsonify({
        "total_deposits": deposits,
        "total_withdrawals": withdrawals,
        "total_transfers": transfers
    }), 200