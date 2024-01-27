# app.py
from flask import Flask
from flask import request
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import pandas as pd
import numpy as np
import json

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

flight_list = [
    'Air Asia',
    'Air India',
    'GoAir',
    'IndiGo',
    'Jet Airways',
    'Jet Airways Business',
    'Multiple carriers',
    'Multiple carriers Premium_economy',
    'SpiceJet',
    'Trujet',
    'Vistara',
    'Vistara Premium economy',
]

from_list = [
    "Chennai",
    "Delhi",
    "Kolkata",
    "Mumbai",
]
to_list = [
    "Banglore",
    "Cochin",
    "Delhi",
    "Hyderabad",
    "Kolkata",
    "New Delhi"
]


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
        json_data = request.get_json()
        obj = json.loads(json_data['body'])
        destination = obj['destination']
        source = obj['source']
        airplane_company = obj['flight']
        stops = int(obj['stop'])
        depDT = obj['departureDT']
        arvlDT = obj['arrivalDT']
        print(obj)
        print(depDT, airplane_company)

        Journey_day = int(pd.to_datetime(depDT, format="%Y-%m-%dT%H:%M").day)
        Journey_month = int(pd.to_datetime(
            depDT, format="%Y-%m-%dT%H:%M").month)

        Dep_hour = int(pd.to_datetime(depDT, format="%Y-%m-%dT%H:%M").hour)
        Dep_min = int(pd.to_datetime(depDT, format="%Y-%m-%dT%H:%M").minute)

        Arrival_hour = int(pd.to_datetime(
            arvlDT, format="%Y-%m-%dT%H:%M").hour)
        Arrival_min = int(pd.to_datetime(
            arvlDT, format="%Y-%m-%dT%H:%M").minute)

        dur_hour = abs(Arrival_hour - Dep_hour)
        dur_min = abs(Arrival_min - Dep_min)

        from_map = [1 if city == source else 0 for city in from_list]

        to_map = [1 if city == destination else 0 for city in to_list]

        air_company_map = [1 if airplane_company ==
                           flight else 0 for flight in flight_list]
        pred_list = [
            stops,
            Journey_day,
            Journey_month,
            Dep_hour,
            Dep_min,
            Arrival_hour,
            Arrival_min,
            dur_hour,
            dur_min,
        ]
        # sequence is important
        for amap in air_company_map:
            pred_list.append(amap)

        for fmap in from_map:
            pred_list.append(fmap)

        for tmap in to_map:
            pred_list.append(tmap)

        print(air_company_map)
        print(pred_list)


api.add_resource(HelloWorldResource, "/")
api.add_resource(RegistrationResource, "/register")
api.add_resource(LoginResource, "/login")
api.add_resource(PredictResource, "/predict")


if __name__ == "__main__":
    app.run(debug=True)
