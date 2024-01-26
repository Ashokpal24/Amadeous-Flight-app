# app.py
from flask import Flask
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": "https://sturdy-spoon-qgpxggv47rv24pvp-5173.app.github.dev"
        }
    },
    supports_credentials=True,
)
api = Api(app)
db_file_path = "sqlite:///users.db"
app.config["SQLALCHEMY_DATABASE_URI"] = db_file_path
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)


if not os.path.exists(db_file_path):
    with app.app_context():
        db.create_all()


parser = reqparse.RequestParser()
parser.add_argument("username", type=str, help="Username for registration")
parser.add_argument("password", type=str,
                    help="Password for registration and login")


class HelloWorldResource(Resource):
    def get(self):
        return {"message": "Hello, World!"}


class RegistrationResource(Resource):
    def post(self):
        args = parser.parse_args()
        username = args["username"]
        password = args["password"]

        with app.app_context():
            if User.query.filter(User.username == username).first():
                return {"message": "User already exists", "severity": "warning"}, 400

            new_user = User(username=username, password=password)
            db.session.add(new_user)
            db.session.commit()

        return {"message": "User registered successfully", "severity": "success"}, 201


class LoginResource(Resource):
    def post(self):
        args = parser.parse_args()
        username = args["username"]
        password = args["password"]

        with app.app_context():
            user = User.query.filter(
                User.username == username, User.password == password
            ).first()

        if user:
            return {"message": "Login successful", "severity": "success"}, 200
        else:
            return {"message": "Invalid credentials", "severity": "error"}, 401


class PredictResource(Resource):
    def post(self):
        args = parser.parse_args()
        print(args)


api.add_resource(HelloWorldResource, "/")
api.add_resource(RegistrationResource, "/register")
api.add_resource(LoginResource, "/login")
api.add_resource(PredictResource, "/predict")


if __name__ == "__main__":
    app.run(debug=True)
