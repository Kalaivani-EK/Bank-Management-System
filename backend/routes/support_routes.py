from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from database.db import db
from models.support_ticket import SupportTicket

support_bp = Blueprint(
    "support",
    __name__
)

@support_bp.route("/test")
def test_support():

    return {
        "message": "Support routes working"
    }

@support_bp.route("/create-ticket", methods=["POST"])
@jwt_required()
def create_ticket():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({
            "message": "Customer access required"
        }), 403

    data = request.get_json()

    ticket = SupportTicket(
        customer_id=int(user_id),
        subject=data["subject"],
        description=data["description"],
        status="Open"
    )

    db.session.add(ticket)
    db.session.commit()

    return jsonify({
        "message": "Ticket created successfully"
    }), 201

@support_bp.route("/my-tickets", methods=["GET"])
@jwt_required()
def my_tickets():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type != "customer":
        return jsonify({
            "message": "Customer access required"
        }), 403

    tickets = SupportTicket.query.filter_by(
        customer_id=int(user_id)
    ).all()

    result = []

    for ticket in tickets:
        result.append({
            "id": ticket.id,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status
        })

    return jsonify(result), 200