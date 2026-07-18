from database.db import db

class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    email = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    phone = db.Column(
        db.String(20)
    )

    address = db.Column(
        db.String(255)
    )

    kyc_status = db.Column(
        db.String(20),
        default="Pending"
    )

    is_active = db.Column(
        db.Boolean,
        default=False
    )

    role = db.Column(
    db.String(20),
    default="customer"
    )

    def __init__(self, name=None, email=None, password_hash=None, phone=None, address=None, kyc_status="Pending", is_active=False, role="customer", **kwargs):
        super().__init__()
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.phone = phone
        self.address = address
        self.kyc_status = kyc_status
        self.is_active = is_active
        self.role = role

    def __repr__(self):
        return f"<Customer {self.name}>"