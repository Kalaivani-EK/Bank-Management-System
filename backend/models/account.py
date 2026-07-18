from database.db import db

class BankAccount(db.Model):
    __tablename__ = "bank_accounts"

    id = db.Column(db.Integer, primary_key=True)

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customers.id")
    )

    account_number = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    account_type = db.Column(
        db.String(20)
    )

    balance = db.Column(
        db.Float,
        default=0.0
    )

    status = db.Column(
        db.String(20),
        default="Active"
    )