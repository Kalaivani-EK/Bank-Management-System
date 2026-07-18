from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash

from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from database.db import db
from models.customer import Customer
from models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    existing_customer = Customer.query.filter_by(
        email=data["email"]
    ).first()

    if existing_customer:
        return jsonify({
            "message": "Email already exists"
        }), 400

    customer = Customer(
        name=data["name"],
        email=data["email"],
        password_hash=generate_password_hash(
            data["password"]
        ),
        phone=data["phone"],
        address=data["address"],
        kyc_status="Pending",
        is_active=True
    )

    db.session.add(customer)
    db.session.commit()

    return jsonify({
        "message": "Registration successful. Awaiting admin approval."
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    # Check Customer table first
    customer = Customer.query.filter_by(
        email=data["email"]
    ).first()

    if customer:

        if not check_password_hash(
            customer.password_hash,
            data["password"]
        ):
            return jsonify({
                "message": "Invalid password"
            }), 401

        access_token = create_access_token(
            identity=f"customer:{customer.id}"
        )

        return jsonify({
            "token": access_token,
            "role": customer.role,
            "user_id": customer.id
        }), 200

    # Check Admin/User table
    user = User.query.filter_by(
        email=data["email"]
    ).first()

    if user:

        if not check_password_hash(
            user.password_hash,
            data["password"]
        ):
            return jsonify({
                "message": "Invalid password"
            }), 401

        access_token = create_access_token(
            identity=f"user:{user.id}"
        )

        return jsonify({
            "token": access_token,
            "role": user.role,
            "user_id": user.id
        }), 200

    return jsonify({
        "message": "Invalid email"
    }), 401

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

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
        "kyc_status": customer.kyc_status,
        "is_active": customer.is_active,
        "role": customer.role
    }), 200