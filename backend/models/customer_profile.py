from backend.database.db import db
from datetime import datetime

class CustomerProfile(db.Model):
    __tablename__ = "customer_profiles"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), unique=True, nullable=False)
    
    # Photo & Personal Info
    profile_photo = db.Column(db.Text, nullable=True) # Data URL or Image string
    dob = db.Column(db.String(20), nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    father_name = db.Column(db.String(100), nullable=True)
    mother_name = db.Column(db.String(100), nullable=True)
    occupation = db.Column(db.String(100), nullable=True)
    annual_income = db.Column(db.String(50), nullable=True)
    marital_status = db.Column(db.String(20), nullable=True)
    nationality = db.Column(db.String(50), default="Indian")

    # Contact Info
    alt_phone = db.Column(db.String(20), nullable=True)
    address_line1 = db.Column(db.String(255), nullable=True)
    address_line2 = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), default="India")
    pincode = db.Column(db.String(20), nullable=True)

    # Bank Info
    ifsc_code = db.Column(db.String(20), default="FINO0001024")
    branch_name = db.Column(db.String(100), default="Main Central Branch")
    branch_address = db.Column(db.String(255), default="Financial District, Tech Park, City")
    nominee_name = db.Column(db.String(100), nullable=True)
    nominee_relationship = db.Column(db.String(50), nullable=True)
    credit_score = db.Column(db.Integer, default=750)

    # Security & Preferences
    two_factor_enabled = db.Column(db.Boolean, default=False)
    login_alerts_enabled = db.Column(db.Boolean, default=True)
    email_notifications = db.Column(db.Boolean, default=True)
    sms_notifications = db.Column(db.Boolean, default=True)
    transaction_alerts = db.Column(db.Boolean, default=True)
    promo_emails = db.Column(db.Boolean, default=False)

    theme = db.Column(db.String(20), default="dark")
    language = db.Column(db.String(50), default="English")
    currency = db.Column(db.String(10), default="INR (₹)")
    time_zone = db.Column(db.String(50), default="IST (UTC+5:30)")
    date_format = db.Column(db.String(30), default="DD/MM/YYYY")

    # KYC & Documents
    aadhaar_doc = db.Column(db.String(255), nullable=True)
    pan_doc = db.Column(db.String(255), nullable=True)
    passport_doc = db.Column(db.String(255), nullable=True)

    # Emergency Contact
    emergency_name = db.Column(db.String(100), nullable=True)
    emergency_relation = db.Column(db.String(50), nullable=True)
    emergency_phone = db.Column(db.String(20), nullable=True)
    emergency_address = db.Column(db.String(255), nullable=True)

    # Metadata & Closure
    last_login_at = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    closure_requested = db.Column(db.Boolean, default=False)
    closure_reason = db.Column(db.Text, nullable=True)

    def __init__(self, customer_id=None, **kwargs):
        super().__init__()
        self.customer_id = customer_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
