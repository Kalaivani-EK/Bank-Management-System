from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from database.db import db
from models.loan import LoanApplication

loan_bp = Blueprint(
    "loan",
    __name__
)

@loan_bp.route("/test")
def test_loan():

    return {
        "message": "Loan routes working"
    }

@loan_bp.route("/apply", methods=["POST"])
@jwt_required()
def apply_loan():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({
            "message": "Customer access required"
        }), 403

    data = request.get_json()

    loan = LoanApplication(
        customer_id=int(user_id),
        loan_type=data["loan_type"],
        amount_requested=data["amount_requested"],
        duration_months=data["duration_months"],
        status="Pending"
    )

    db.session.add(loan)
    db.session.commit()

    return jsonify({
        "message": "Loan application submitted successfully"
    }), 201

@loan_bp.route("/my-loans", methods=["GET"])
@jwt_required()
def my_loans():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({
            "message": "Customer access required"
        }), 403

    loans = LoanApplication.query.filter_by(
        customer_id=int(user_id)
    ).all()

    result = []

    for loan in loans:
        result.append({
            "id": loan.id,
            "loan_type": loan.loan_type,
            "amount_requested": loan.amount_requested,
            "duration_months": loan.duration_months,
            "status": loan.status,
            "remarks": loan.remarks
        })

    return jsonify(result), 200