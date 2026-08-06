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

    transaction_pin_hash = db.Column(
        db.String(128),
        nullable=True
    )

    status = db.Column(
        db.String(20),
        default="Active"
    )

    def __init__(self, customer_id=None, account_number=None, account_type=None, balance=0.0, status="Active", transaction_pin_hash=None, **kwargs):
        super().__init__()
        self.customer_id = customer_id
        self.account_number = account_number
        self.account_type = account_type
        self.balance = balance
        self.status = status
        self.transaction_pin_hash = transaction_pin_hash

