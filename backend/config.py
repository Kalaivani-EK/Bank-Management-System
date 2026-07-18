class Config:
    SECRET_KEY = "bank_secret_key"

    JWT_SECRET_KEY = "jwt_secret_key"

    SQLALCHEMY_DATABASE_URI = "sqlite:///bank.db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False