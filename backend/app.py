from flask import Flask

from backend.config import Config
from backend.database.db import db
from datetime import timedelta

from flask_jwt_extended import JWTManager
from flask_cors import CORS

from backend.routes.auth_routes import auth_bp
from backend.routes.admin_routes import admin_bp
from backend.routes.customer_routes import customer_bp
from backend.routes.account_routes import account_bp
from backend.routes.transaction_routes import transaction_bp
from backend.routes.loan_routes import loan_bp
from backend.routes.support_routes import support_bp

from backend.models.customer import Customer
from backend.models.account import BankAccount
from backend.models.transaction import Transaction
from backend.models.loan import LoanApplication
from backend.models.support_ticket import SupportTicket
from backend.models.user import User

from backend.utils.admin_seeder import create_admin
app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

jwt = JWTManager(app)

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print("INVALID TOKEN:", error)
    return {"message": error}, 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("TOKEN EXPIRED")
    return {"message": "Token expired"}, 401


@jwt.unauthorized_loader
def unauthorized_callback(error):
    print("UNAUTHORIZED:", error)
    return {"message": error}, 401

db.init_app(app)

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    admin_bp,
    url_prefix="/api/admin"
)

app.register_blueprint(
    customer_bp,
    url_prefix="/api/customer"
)

app.register_blueprint(
    account_bp,
    url_prefix="/api/accounts"
)

app.register_blueprint(
    transaction_bp,
    url_prefix="/api/transactions"
)

app.register_blueprint(
    loan_bp,
    url_prefix="/api/loans"
)

app.register_blueprint(
    support_bp,
    url_prefix="/api/support"
)

@app.route("/")
def home():
    return "Bank Management Backend Running"

with app.app_context():
    db.create_all()

    create_admin()

if __name__ == "__main__":
    app.run(debug=True)