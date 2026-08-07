from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.database.db import db
from backend.models.notification import Notification

notification_bp = Blueprint("notification", __name__)

def get_current_customer_id():
    identity = get_jwt_identity()
    if not identity or ":" not in identity:
        return None, "Invalid authentication identity"
    
    parts = identity.split(":")
    user_type = parts[0]
    user_id = parts[1]
    
    if user_type != "customer":
        return None, "Customer access required"
    
    try:
        return int(user_id), None
    except ValueError:
        return None, "Invalid user ID format"


@notification_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    customer_id, err = get_current_customer_id()
    if err:
        return jsonify({"message": err}), 403

    query = Notification.query.filter_by(customer_id=customer_id)

    # Search filter
    search = request.args.get("q") or request.args.get("search")
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Notification.title.ilike(search_pattern)) | 
            (Notification.message.ilike(search_pattern))
        )

    # Type filter
    n_type = request.args.get("type")
    if n_type and n_type.lower() != "all":
        query = query.filter(Notification.type == n_type.lower())

    # Read/Unread status filter
    status = request.args.get("status")
    if status:
        if status.lower() == "unread":
            query = query.filter(Notification.is_read == False)
        elif status.lower() == "read":
            query = query.filter(Notification.is_read == True)

    query = query.order_by(Notification.created_at.desc())

    # Pagination
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
    except ValueError:
        page = 1
        per_page = 10

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    unread_count = Notification.query.filter_by(customer_id=customer_id, is_read=False).count()

    notifications_list = [n.to_dict() for n in paginated.items]

    return jsonify({
        "notifications": notifications_list,
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages,
        "unread_count": unread_count
    }), 200


@notification_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def get_unread_count():
    customer_id, err = get_current_customer_id()
    if err:
        return jsonify({"message": err}), 403

    unread_count = Notification.query.filter_by(customer_id=customer_id, is_read=False).count()
    return jsonify({"unread_count": unread_count}), 200


@notification_bp.route("/<int:id>/read", methods=["PUT"])
@jwt_required()
def mark_as_read(id):
    customer_id, err = get_current_customer_id()
    if err:
        return jsonify({"message": err}), 403

    notification = Notification.query.get(id)
    if not notification:
        return jsonify({"message": "Notification not found"}), 404

    if notification.customer_id != customer_id:
        return jsonify({"message": "Unauthorized access to notification"}), 403

    notification.is_read = True
    db.session.commit()

    unread_count = Notification.query.filter_by(customer_id=customer_id, is_read=False).count()

    return jsonify({
        "message": "Notification marked as read",
        "notification": notification.to_dict(),
        "unread_count": unread_count
    }), 200


@notification_bp.route("/mark-all-read", methods=["PUT"])
@jwt_required()
def mark_all_read():
    customer_id, err = get_current_customer_id()
    if err:
        return jsonify({"message": err}), 403

    Notification.query.filter_by(customer_id=customer_id, is_read=False).update({"is_read": True})
    db.session.commit()

    return jsonify({
        "message": "All notifications marked as read",
        "unread_count": 0
    }), 200


@notification_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_notification(id):
    customer_id, err = get_current_customer_id()
    if err:
        return jsonify({"message": err}), 403

    notification = Notification.query.get(id)
    if not notification:
        return jsonify({"message": "Notification not found"}), 404

    if notification.customer_id != customer_id:
        return jsonify({"message": "Unauthorized access to notification"}), 403

    db.session.delete(notification)
    db.session.commit()

    unread_count = Notification.query.filter_by(customer_id=customer_id, is_read=False).count()

    return jsonify({
        "message": "Notification deleted successfully",
        "unread_count": unread_count
    }), 200
