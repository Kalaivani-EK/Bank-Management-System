from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models.account import BankAccount
from models.transaction import Transaction
from models.loan import LoanApplication
from models.support_ticket import SupportTicket
from models.customer import Customer

from utils.role_checker import get_current_user
from database.db import db

admin_bp = Blueprint(
    "admin",
    __name__
)


@admin_bp.route("/customers", methods=["GET"])
@jwt_required()
def get_customers():

    user = get_current_user()

    if user.role != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403

    customers = Customer.query.all()

    result = []

    for customer in customers:
        result.append({
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "kyc_status": customer.kyc_status,
            "is_active": customer.is_active
        })

    return jsonify(result), 200


@admin_bp.route("/approve-kyc/<int:id>", methods=["PUT"])
@jwt_required()
def approve_kyc(id):

    user = get_current_user()

    if user.role != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403

    customer = Customer.query.get(id)

    if not customer:
        return jsonify({
            "message": "Customer not found"
        }), 404

    customer.is_active = True
    customer.kyc_status = "Approved"

    db.session.commit()

    return jsonify({
        "message": f"KYC approved for {customer.name}"
    }), 200

@admin_bp.route("/pending-customers", methods=["GET"])
@jwt_required()
def pending_customers():

    user = get_current_user()

    if user.role != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403

    customers = Customer.query.filter_by(
        kyc_status="Pending"
    ).all()

    result = []

    for customer in customers:
        result.append({
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "kyc_status": customer.kyc_status
        })

    return jsonify(result), 200

def generate_unique_account_number():
    import random
    while True:
        num = "".join([str(random.randint(0, 9)) for _ in range(12)])
        exists = BankAccount.query.filter_by(account_number=num).first()
        if not exists:
            return num

@admin_bp.route("/accounts", methods=["GET"])
@jwt_required()
def get_accounts():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    accounts = BankAccount.query.all()
    result = []
    for account in accounts:
        result.append({
            "id": account.id,
            "customer_id": account.customer_id,
            "account_number": account.account_number,
            "account_type": account.account_type,
            "balance": account.balance,
            "status": account.status
        })
    return jsonify(result), 200

@admin_bp.route("/create-account", methods=["POST"])
@jwt_required()
def create_account():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json()
    customer_id = data.get("customer_id")
    account_type = data.get("account_type")
    initial_balance = float(data.get("initial_balance", 0.0))

    if initial_balance < 0:
        return jsonify({"message": "Initial balance cannot be negative"}), 400

    if not customer_id or not account_type:
        return jsonify({"message": "customer_id and account_type are required"}), 400

    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"message": "Customer not found"}), 404

    account_number = generate_unique_account_number()

    new_account = BankAccount(
        customer_id=customer_id,
        account_number=account_number,
        account_type=account_type,
        balance=initial_balance,
        status="Active"
    )

    db.session.add(new_account)
    db.session.flush()

    if initial_balance > 0:
        transaction = Transaction(
            from_account_id=new_account.id,
            to_account_id=new_account.id,
            account_id=new_account.id,
            transaction_type="Deposit",
            amount=initial_balance,
            status="Success"
        )
        db.session.add(transaction)

    db.session.commit()

    return jsonify({
        "message": "Account created successfully",
        "account_id": new_account.id,
        "account_number": account_number
    }), 201

@admin_bp.route("/freeze-account/<int:id>", methods=["PUT"])
@jwt_required()
def freeze_account(id):
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    account = BankAccount.query.get(id)
    if not account:
        return jsonify({"message": "Account not found"}), 404

    account.status = "Frozen"
    db.session.commit()

    return jsonify({
        "message": f"Account {account.account_number} has been frozen"
    }), 200

@admin_bp.route("/activate-account/<int:id>", methods=["PUT"])
@jwt_required()
def activate_account(id):
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    account = BankAccount.query.get(id)
    if not account:
        return jsonify({"message": "Account not found"}), 404

    account.status = "Active"
    db.session.commit()

    return jsonify({
        "message": f"Account {account.account_number} has been activated"
    }), 200

@admin_bp.route("/close-account/<int:id>", methods=["PUT"])
@jwt_required()
def close_account(id):
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    account = BankAccount.query.get(id)
    if not account:
        return jsonify({"message": "Account not found"}), 404

    account.status = "Closed"
    db.session.commit()

    return jsonify({
        "message": f"Account {account.account_number} has been closed"
    }), 200

@admin_bp.route("/deposit", methods=["POST"])
@jwt_required()
def admin_deposit():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json()
    account_id = data.get("account_id")
    amount = data.get("amount")

    if not account_id or amount is None:
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

    if account.status != "Active":
        return jsonify({"message": f"Cannot deposit into an account with status: {account.status}"}), 400

    account.balance += amount

    transaction = Transaction(
        from_account_id=account.id,
        to_account_id=account.id,
        transaction_type="Deposit",
        amount=amount,
        status="Success"
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        "message": "Deposit successful",
        "new_balance": account.balance
    }), 200

@admin_bp.route("/check-admin")
def check_admin():

    from models.user import User

    admin = User.query.filter_by(
        email="admin@bank.com"
    ).first()

    if admin:
        return {
            "email": admin.email,
            "role": admin.role
        }

    return {
        "message": "Admin not found"
    }

@admin_bp.route("/loan-applications", methods=["GET"])
@jwt_required()
def loan_applications():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    loans = LoanApplication.query.all()
    result = []
    for loan in loans:
        result.append({
            "id": loan.id,
            "customer_id": loan.customer_id,
            "loan_type": loan.loan_type,
            "amount_requested": loan.amount_requested,
            "duration_months": loan.duration_months,
            "status": loan.status,
            "remarks": loan.remarks,
            "approved_at": loan.approved_at.strftime("%Y-%m-%d %H:%M:%S") if loan.approved_at else None
        })

    return jsonify(result), 200

@admin_bp.route("/approve-loan/<int:id>", methods=["PUT"])
@jwt_required()
def approve_loan(id):
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    loan = LoanApplication.query.get(id)
    if not loan:
        return jsonify({"message": "Loan not found"}), 404

    if loan.status != "Pending":
        return jsonify({"message": "Loan already processed"}), 400

    data = request.get_json() or {}
    remarks = data.get("remarks")

    # Find customer's active bank account
    account = BankAccount.query.filter_by(customer_id=loan.customer_id, status="Active").first()
    if not account:
        return jsonify({"message": "Approval without active account is blocked"}), 400

    # Credit loan amount
    account.balance += loan.amount_requested

    # Create transaction log
    transaction = Transaction(
        from_account_id=account.id,
        to_account_id=account.id,
        account_id=account.id,
        transaction_type="Loan Credit",
        amount=loan.amount_requested,
        status="Success"
    )
    db.session.add(transaction)

    from datetime import datetime
    loan.status = "Approved"
    loan.remarks = remarks
    loan.approved_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "message": "Loan approved and amount credited successfully"
    }), 200

@admin_bp.route("/reject-loan/<int:id>", methods=["PUT"])
@jwt_required()
def reject_loan(id):
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    loan = LoanApplication.query.get(id)
    if not loan:
        return jsonify({"message": "Loan not found"}), 404

    if loan.status != "Pending":
        return jsonify({"message": "Loan already processed"}), 400

    data = request.get_json() or {}
    remarks = data.get("remarks")

    loan.status = "Rejected"
    loan.remarks = remarks

    db.session.commit()

    return jsonify({
        "message": "Loan rejected successfully"
    }), 200

@admin_bp.route("/loan-summary", methods=["GET"])
@jwt_required()
def loan_summary():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    approved_amount = db.session.query(db.func.sum(LoanApplication.amount_requested))\
        .filter(LoanApplication.status == "Approved").scalar() or 0.0

    pending_amount = db.session.query(db.func.sum(LoanApplication.amount_requested))\
        .filter(LoanApplication.status == "Pending").scalar() or 0.0

    rejected_amount = db.session.query(db.func.sum(LoanApplication.amount_requested))\
        .filter(LoanApplication.status == "Rejected").scalar() or 0.0

    return jsonify({
        "approved_amount": approved_amount,
        "pending_amount": pending_amount,
        "rejected_amount": rejected_amount
    }), 200

@admin_bp.route("/tickets", methods=["GET"])
@jwt_required()
def get_tickets():

    user = get_current_user()

    if user.role != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403

    tickets = SupportTicket.query.all()

    result = []

    for ticket in tickets:
        result.append({
            "id": ticket.id,
            "customer_id": ticket.customer_id,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status
        })

    return jsonify(result), 200

@admin_bp.route("/resolve-ticket/<int:id>", methods=["PUT"])
@jwt_required()
def resolve_ticket(id):

    user = get_current_user()

    if user.role != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403

    ticket = SupportTicket.query.get(id)

    if not ticket:
        return jsonify({
            "message": "Ticket not found"
        }), 404

    ticket.status = "Resolved"

    db.session.commit()

    return jsonify({
        "message": "Ticket resolved successfully"
    }), 200

@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def admin_dashboard():

    user = get_current_user()

    if user.role != "admin":
        return jsonify({
            "message": "Admin access required"
        }), 403
    
    total_customers = Customer.query.count()
    total_accounts = BankAccount.query.count()
    total_loans = LoanApplication.query.count()
    total_tickets = SupportTicket.query.count()

    return jsonify({
    "total_customers": Customer.query.count(),
    "total_accounts": BankAccount.query.count(),
    "total_loans": LoanApplication.query.count(),
    "total_tickets": SupportTicket.query.count()
}), 200

@admin_bp.route("/transactions", methods=["GET"])
@jwt_required()
def admin_transactions():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    query = db.session.query(Transaction, BankAccount.customer_id)\
        .outerjoin(BankAccount, Transaction.account_id == BankAccount.id)

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
    for txn, customer_id in paginated.items:
        result.append({
            "id": txn.id,
            "account_id": txn.account_id,
            "customer_id": customer_id,
            "transaction_type": txn.transaction_type,
            "amount": txn.amount,
            "created_at": txn.created_at.strftime("%Y-%m-%d %H:%M:%S") if txn.created_at else None
        })

    return jsonify({
        "transactions": result,
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages
    }), 200

@admin_bp.route("/dashboard-summary", methods=["GET"])
@jwt_required()
def admin_dashboard_summary():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    # Total deposits volume
    total_deposits = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.transaction_type == "Deposit").scalar() or 0.0

    # Total withdrawals volume
    total_withdrawals = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.transaction_type == "Withdrawal").scalar() or 0.0

    # Total transfers volume (sum of Transfer Out)
    total_transfers = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.transaction_type == "Transfer Out").scalar() or 0.0

    total_customers = Customer.query.count()
    active_accounts = BankAccount.query.filter_by(status="Active").count()
    loan_applications = LoanApplication.query.count()
    approved_loans = LoanApplication.query.filter_by(status="Approved").count()
    open_tickets = SupportTicket.query.filter_by(status="Open").count()

    return jsonify({
        "total_deposits": total_deposits,
        "total_withdrawals": total_withdrawals,
        "total_transfers": total_transfers,
        "total_customers": total_customers,
        "active_accounts": active_accounts,
        "loan_applications": loan_applications,
        "approved_loans": approved_loans,
        "open_tickets": open_tickets
    }), 200

@admin_bp.route("/transaction-trend", methods=["GET"])
@jwt_required()
def admin_transaction_trend():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    from datetime import datetime, timedelta
    today = datetime.utcnow().date()
    trend = []

    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        
        d_start = datetime.combine(d, datetime.min.time())
        d_end = datetime.combine(d, datetime.max.time())
        
        count = db.session.query(db.func.count(Transaction.id)).filter(
            Transaction.created_at >= d_start,
            Transaction.created_at <= d_end
        ).scalar() or 0
        
        trend.append({
            "date": d_str,
            "count": count
        })

    return jsonify(trend), 200

@admin_bp.route("/account-distribution", methods=["GET"])
@jwt_required()
def admin_account_distribution():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    savings_count = BankAccount.query.filter_by(account_type="Savings").count()
    current_count = BankAccount.query.filter_by(account_type="Current").count()

    return jsonify([
        {"name": "Savings", "value": savings_count},
        {"name": "Current", "value": current_count}
    ]), 200

@admin_bp.route("/loan-breakdown", methods=["GET"])
@jwt_required()
def admin_loan_breakdown():
    user = get_current_user()
    if user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    approved = LoanApplication.query.filter_by(status="Approved").count()
    pending = LoanApplication.query.filter_by(status="Pending").count()
    rejected = LoanApplication.query.filter_by(status="Rejected").count()

    return jsonify([
        {"status": "Approved", "count": approved},
        {"status": "Pending", "count": pending},
        {"status": "Rejected", "count": rejected}
    ]), 200