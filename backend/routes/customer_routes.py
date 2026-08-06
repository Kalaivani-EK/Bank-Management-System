from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
import calendar
from datetime import datetime

from backend.database.db import db
from backend.models.customer import Customer
from backend.models.customer_profile import CustomerProfile
from backend.models.customer_activity import CustomerActivity
from backend.models.account import BankAccount
from backend.models.loan import LoanApplication
from backend.models.support_ticket import SupportTicket
from backend.models.transaction import Transaction

customer_bp = Blueprint(
    "customer",
    __name__
)

def get_or_create_profile(customer_id):
    profile = CustomerProfile.query.filter_by(customer_id=customer_id).first()
    if not profile:
        profile = CustomerProfile(customer_id=customer_id)
        db.session.add(profile)
        db.session.commit()
    return profile

def calculate_completion(customer, profile):
    total_fields = 10
    completed = 0
    if customer.email: completed += 1
    if customer.name: completed += 1
    if customer.phone: completed += 1
    if customer.kyc_status == "Approved": completed += 1
    if profile.dob: completed += 1
    if profile.pan_doc or customer.kyc_status == "Approved": completed += 1
    if profile.aadhaar_doc or customer.kyc_status == "Approved": completed += 1
    if profile.nominee_name: completed += 1
    if profile.emergency_name: completed += 1
    if profile.address_line1 or customer.address: completed += 1
    return int((completed / total_fields) * 100)

@customer_bp.route("/profile", methods=["GET"])
@jwt_required()
def customer_profile():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    customer = Customer.query.get(int(user_id))
    if not customer:
        return jsonify({"message": "Customer not found"}), 404

    profile = get_or_create_profile(customer.id)
    primary_account = BankAccount.query.filter_by(customer_id=customer.id).first()

    completion_score = calculate_completion(customer, profile)

    return jsonify({
        # Header Info
        "id": customer.id,
        "customer_id_str": f"CUST-{customer.id:06d}",
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone or "",
        "address": customer.address or "",
        "kyc_status": customer.kyc_status,
        "is_active": customer.is_active,
        "account_number": primary_account.account_number if primary_account else "N/A",
        "account_type": primary_account.account_type if primary_account else "Savings",
        "last_login": profile.last_login_at or datetime.now().strftime("%b %d, %Y %I:%M %p"),

        # Photo & Personal Info
        "profile_photo": profile.profile_photo or "",
        "dob": profile.dob or "",
        "gender": profile.gender or "",
        "father_name": profile.father_name or "",
        "mother_name": profile.mother_name or "",
        "occupation": profile.occupation or "",
        "annual_income": profile.annual_income or "",
        "marital_status": profile.marital_status or "",
        "nationality": profile.nationality or "Indian",

        # Contact Details
        "alt_phone": profile.alt_phone or "",
        "address_line1": profile.address_line1 or customer.address or "",
        "address_line2": profile.address_line2 or "",
        "city": profile.city or "",
        "state": profile.state or "",
        "country": profile.country or "India",
        "pincode": profile.pincode or "",

        # Bank Details
        "ifsc_code": profile.ifsc_code or "FINO0001024",
        "branch_name": profile.branch_name or "Main Central Branch",
        "branch_address": profile.branch_address or "Financial District, Tech Park, City",
        "opening_date": profile.created_at.strftime("%b %d, %Y") if profile.created_at else "Jan 15, 2024",
        "nominee_name": profile.nominee_name or "",
        "nominee_relationship": profile.nominee_relationship or "",

        # Security & Preferences
        "two_factor_enabled": profile.two_factor_enabled,
        "login_alerts_enabled": profile.login_alerts_enabled,
        "email_notifications": profile.email_notifications,
        "sms_notifications": profile.sms_notifications,
        "transaction_alerts": profile.transaction_alerts,
        "promo_emails": profile.promo_emails,
        "theme": profile.theme or "dark",
        "language": profile.language or "English",
        "currency": profile.currency or "INR (₹)",
        "time_zone": profile.time_zone or "IST (UTC+5:30)",
        "date_format": profile.date_format or "DD/MM/YYYY",

        # KYC Docs
        "aadhaar_doc": profile.aadhaar_doc or "",
        "pan_doc": profile.pan_doc or "",
        "passport_doc": profile.passport_doc or "",

        # Emergency Contact
        "emergency_name": profile.emergency_name or "",
        "emergency_relation": profile.emergency_relation or "",
        "emergency_phone": profile.emergency_phone or "",
        "emergency_address": profile.emergency_address or "",

        # Stats & Score
        "credit_score": profile.credit_score or 750,
        "completion_score": completion_score,
        "closure_requested": profile.closure_requested
    }), 200

@customer_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_customer_profile():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    customer = Customer.query.get(int(user_id))
    if not customer:
        return jsonify({"message": "Customer not found"}), 404

    profile = get_or_create_profile(customer.id)
    data = request.get_json() or {}

    # Update Customer main attributes if provided
    if "name" in data and data["name"]:
        customer.name = data["name"]
    if "phone" in data:
        customer.phone = data["phone"]
    if "address" in data:
        customer.address = data["address"]

    # Update Profile fields
    for field in [
        "dob", "gender", "father_name", "mother_name", "occupation",
        "annual_income", "marital_status", "nationality", "alt_phone",
        "address_line1", "address_line2", "city", "state", "country", "pincode",
        "nominee_name", "nominee_relationship", "emergency_name",
        "emergency_relation", "emergency_phone", "emergency_address",
        "theme", "language", "currency", "time_zone", "date_format"
    ]:
        if field in data:
            setattr(profile, field, data[field])

    # Log Activity
    activity = CustomerActivity(
        customer_id=customer.id,
        activity_type="Profile Update",
        description="Updated personal information and contact details"
    )
    db.session.add(activity)
    db.session.commit()

    return jsonify({"message": "Profile updated successfully"}), 200

@customer_bp.route("/profile-photo", methods=["POST"])
@jwt_required()
def update_profile_photo():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    customer = Customer.query.get(int(user_id))
    if not customer:
        return jsonify({"message": "Customer not found"}), 404

    profile = get_or_create_profile(customer.id)
    data = request.get_json() or {}
    
    photo_data = data.get("profile_photo", "")
    profile.profile_photo = photo_data

    activity = CustomerActivity(
        customer_id=customer.id,
        activity_type="Profile Update",
        description="Updated profile avatar picture" if photo_data else "Removed profile avatar picture"
    )
    db.session.add(activity)
    db.session.commit()

    return jsonify({"message": "Profile photo updated successfully", "profile_photo": photo_data}), 200

@customer_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_customer_password():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    customer = Customer.query.get(int(user_id))
    if not customer:
        return jsonify({"message": "Customer not found"}), 404

    data = request.get_json() or {}
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Current password and new password are required"}), 400

    if not check_password_hash(customer.password_hash, current_password):
        return jsonify({"message": "Current password is incorrect"}), 400

    if len(new_password) < 6:
        return jsonify({"message": "New password must be at least 6 characters"}), 400

    customer.password_hash = generate_password_hash(new_password)

    activity = CustomerActivity(
        customer_id=customer.id,
        activity_type="Password Change",
        description="Updated account security password"
    )
    db.session.add(activity)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"}), 200

@customer_bp.route("/activity", methods=["GET"])
@jwt_required()
def customer_activity():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    customer_id = int(user_id)
    activities = CustomerActivity.query.filter_by(customer_id=customer_id).order_by(CustomerActivity.created_at.desc()).limit(15).all()

    accounts = BankAccount.query.filter_by(customer_id=customer_id).all()
    account_ids = [acc.id for acc in accounts]

    tx_activities = []
    if account_ids:
        recent_txs = Transaction.query.filter(Transaction.account_id.in_(account_ids)).order_by(Transaction.created_at.desc()).limit(15).all()
        for tx in recent_txs:
            tx_activities.append({
                "id": f"tx-{tx.id}",
                "activity_type": tx.transaction_type,
                "description": f"{tx.transaction_type} of ₹{tx.amount:,.2f} - Status: {tx.status}",
                "timestamp": tx.created_at.strftime("%b %d, %Y %I:%M %p") if tx.created_at else "Recently"
            })

    activity_list = []
    for act in activities:
        activity_list.append({
            "id": f"act-{act.id}",
            "activity_type": act.activity_type,
            "description": act.description,
            "timestamp": act.created_at.strftime("%b %d, %Y %I:%M %p") if act.created_at else "Recently"
        })

    combined = sorted(activity_list + tx_activities, key=lambda x: x["timestamp"], reverse=True)[:20]

    return jsonify(combined), 200

@customer_bp.route("/accounts", methods=["GET"])
@jwt_required()
def customer_accounts():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    accounts = BankAccount.query.filter_by(customer_id=int(user_id)).all()
    account_ids = [acc.id for acc in accounts]

    result = []
    for acc in accounts:
        result.append({
            "id": acc.id,
            "account_number": acc.account_number,
            "account_type": acc.account_type,
            "balance": acc.balance,
            "status": acc.status
        })

    # Add mock FD/RD if not in database to showcase linked accounts feature
    if not any(a["account_type"] == "Fixed Deposit" for a in result):
        result.append({
            "id": 901,
            "account_number": "FD-9840214829",
            "account_type": "Fixed Deposit",
            "balance": 50000.0,
            "status": "Active"
        })
    if not any(a["account_type"] == "Recurring Deposit" for a in result):
        result.append({
            "id": 902,
            "account_number": "RD-7731049210",
            "account_type": "Recurring Deposit",
            "balance": 12000.0,
            "status": "Active"
        })

    return jsonify(result), 200

@customer_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications_preferences():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    profile = get_or_create_profile(int(user_id))
    return jsonify({
        "email_notifications": profile.email_notifications,
        "sms_notifications": profile.sms_notifications,
        "transaction_alerts": profile.transaction_alerts,
        "login_alerts": profile.login_alerts_enabled,
        "promo_emails": profile.promo_emails
    }), 200

@customer_bp.route("/notifications", methods=["PUT"])
@jwt_required()
def update_notifications_preferences():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    profile = get_or_create_profile(int(user_id))
    data = request.get_json() or {}

    if "email_notifications" in data: profile.email_notifications = bool(data["email_notifications"])
    if "sms_notifications" in data: profile.sms_notifications = bool(data["sms_notifications"])
    if "transaction_alerts" in data: profile.transaction_alerts = bool(data["transaction_alerts"])
    if "login_alerts" in data: profile.login_alerts_enabled = bool(data["login_alerts"])
    if "promo_emails" in data: profile.promo_emails = bool(data["promo_emails"])

    db.session.commit()
    return jsonify({"message": "Notification preferences updated"}), 200

@customer_bp.route("/kyc", methods=["GET"])
@jwt_required()
def get_kyc_details():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    customer = Customer.query.get(int(user_id))
    profile = get_or_create_profile(int(user_id))

    return jsonify({
        "status": customer.kyc_status,
        "aadhaar": profile.aadhaar_doc or "aadhaar_card_verified.pdf",
        "pan": profile.pan_doc or "pan_card_verified.pdf",
        "passport": profile.passport_doc or "Not Uploaded"
    }), 200

@customer_bp.route("/kyc-upload", methods=["POST"])
@jwt_required()
def upload_kyc_docs():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    customer = Customer.query.get(int(user_id))
    profile = get_or_create_profile(int(user_id))
    data = request.get_json() or {}

    if "aadhaar" in data: profile.aadhaar_doc = data["aadhaar"]
    if "pan" in data: profile.pan_doc = data["pan"]
    if "passport" in data: profile.passport_doc = data["passport"]

    if customer.kyc_status != "Approved":
        customer.kyc_status = "Pending"

    db.session.commit()
    return jsonify({"message": "KYC documents updated successfully", "kyc_status": customer.kyc_status}), 200

@customer_bp.route("/close-account-request", methods=["POST"])
@jwt_required()
def close_account_request():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    customer = Customer.query.get(int(user_id))
    profile = get_or_create_profile(int(user_id))
    data = request.get_json() or {}

    profile.closure_requested = True
    profile.closure_reason = data.get("reason", "Customer requested account closure")

    activity = CustomerActivity(
        customer_id=customer.id,
        activity_type="Account Closure Request",
        description=f"Submitted closure request: {profile.closure_reason}"
    )
    db.session.add(activity)
    db.session.commit()

    return jsonify({"message": "Account closure request submitted successfully. Our team will contact you shortly."}), 200

@customer_bp.route("/transactions", methods=["GET"])
@jwt_required()
def customer_transactions():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    return jsonify({"message": "Customer transactions endpoint working"}), 200

@customer_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def customer_dashboard():
    identity = get_jwt_identity()
    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({"message": "Customer access required"}), 403

    accounts = BankAccount.query.filter_by(customer_id=int(user_id)).all()
    loans = LoanApplication.query.filter_by(customer_id=int(user_id)).all()
    tickets = SupportTicket.query.filter_by(customer_id=int(user_id)).all()
    total_balance = sum(account.balance for account in accounts)

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

    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.month

    months_end = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for m in range(1, current_month + 1):
        _, last_day = calendar.monthrange(current_year, m)
        months_end.append((
            month_names[m - 1],
            datetime(current_year, m, last_day, 23, 59, 59)
        ))

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