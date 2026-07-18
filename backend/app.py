from flask import Flask

from config import Config
from database.db import db
from datetime import timedelta

from flask_jwt_extended import JWTManager
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.customer_routes import customer_bp
from routes.account_routes import account_bp
from routes.transaction_routes import transaction_bp
from routes.loan_routes import loan_bp
from routes.support_routes import support_bp

from models.customer import Customer
from models.account import BankAccount
from models.transaction import Transaction
from models.loan import LoanApplication
from models.support_ticket import SupportTicket
from models.user import User

from utils.admin_seeder import create_admin
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