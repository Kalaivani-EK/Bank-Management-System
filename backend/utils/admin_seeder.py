from models.user import User
from database.db import db

from werkzeug.security import generate_password_hash
from sqlalchemy.exc import IntegrityError


def create_admin():

    admin = User.query.filter_by(
        email="admin@bank.com"
    ).first()

    if not admin:

        admin_user = User(
            name="System Admin",
            email="admin@bank.com",
            password_hash=generate_password_hash(
                "admin123"
            ),
            role="admin"
        )

        try:
            db.session.add(admin_user)
            db.session.commit()
            print("Admin created successfully")
        except IntegrityError:
            db.session.rollback()
            print("Admin committed by concurrent thread")

    else:
        print("Admin already exists")