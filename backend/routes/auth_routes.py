from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    user = User(
        full_name=data["full_name"],
        email=data["email"],
        phone=data["phone"],
        password=data["password"],
        address=data["address"]
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Customer Registered Successfully"
    }), 201