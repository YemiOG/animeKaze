from flask import Flask, jsonify, request,url_for
from . import api
from .. import db
from ..models import User
from .errors import bad_request
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required
from datetime import datetime, timedelta, timezone
from .email import send_password_reset_email
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
							   set_access_cookies, unset_jwt_cookies

@api.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

@api.route('/createuser', methods=['POST'])
def create_user():
	data = request.get_json() or {}
	if data['username'] == '' or data['email'] == '' or data['password'] == '':
		return bad_request('Please make sure all fields are filled in correctly')
	if User.query.filter_by(email=data['email'].lower()).first():
		return bad_request('email address already registered')
	if User.query.filter_by(username=data['username'].lower()).first():
		return bad_request('username already exists')
	user = User()
	user.from_dict(data, new_user=True)
	db.session.add(user)
	db.session.commit()
	response = user.to_dict()
	status_code = 201
	return response, status_code

@api.route("/token", methods=["POST"])
def create_token():
    email = request.json.get("email").lower()
    password = request.json.get("password")
    user = User.query.filter_by(email=email).first()
    if user is not None and user.check_password(password):
        print(user.check_password(password))
        access_token = create_access_token(identity=email)
        response = {"access_token":access_token,
					"userID":user.id,
					"userName":user.username}
        return response
    else:
        return {"msg": "Wrong email or password"}, 401

@api.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

@api.route('/reset_password_request', methods=['POST'])
def reset_password_request():
    response = None
    if request.json.get("token"):
        return bad_request('User is logged in')
    email = request.json.get("email", None).lower()
    user = User.query.filter_by(email=email).first()
    if user:
        send_password_reset_email(user)
        response = {"confirmation":'Check your email for the instructions to reset your password'}
    else:
        return bad_request('Email address not registered')

    return response

@api.route('/reset_password/<token>', methods=['POST'])
def reset_password(token):
    if request.json.get("token"):
        return bad_request('User is logged in')
    user = User.verify_reset_password_token(token)
    if not user:
        return bad_request('User is logged in')
    else:
        password = request.json.get("password", None)
        user.set_password(password)
        db.session.commit()
        response = {"success":'Your password has been reset.'}
        return response
