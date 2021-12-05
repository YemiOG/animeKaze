from . import api
from flask import request,abort, url_for,jsonify
from ..models import User
from .. import db
from .errors import bad_request
from .auth import token_auth

@api.route('/users/<int:id>', methods=['GET'])
@token_auth.login_required
def get_user(id):
	return jsonify(User.query.get_or_404(id).to_dict())

@api.route('/users', methods=['GET'])
@token_auth.login_required
def get_users():
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	data = User.to_collection_dict(User.query, page, per_page, 'api.get_users')
	return jsonify(data)

@api.route('/users/<int:id>/followers', methods=['GET'])
@token_auth.login_required
def get_followers(id):
	user = User.query.get_or_404(id)
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	data = User.to_collection_dict(user.followers, page, per_page,
                                   'api.get_followers', id=id)
	return jsonify(data)


@api.route('/users/<int:id>/followed', methods=['GET'])
@token_auth.login_required
def get_followed(id):
    user = User.query.get_or_404(id)
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    data = User.to_collection_dict(user.followed, page, per_page,
                                   'api.get_followed', id=id)
    return jsonify(data)

@api.route('/users', methods=['POST'])
def create_user():
	data = request.get_json() or {}
	if 'name' not in data or'username' not in data or 'email' not in data or 'password' not in data:
		return bad_request('must include username, email and password fields')
	if User.query.filter_by(username=data['username'].lower()).first():
		return bad_request('username already exists')
	if User.query.filter_by(email=data['email'].lower()).first():
		return bad_request('email address already registered')
	user = User()
	user.from_dict(data, new_user=True)
	db.session.add(user)
	db.session.commit()
	response = jsonify(user.to_dict())
	response.status_code = 201
	response.headers['Location'] = url_for('api.get_user', id=user.id)
	return response

@api.route('/users/<int:id>', methods=['PUT'])
@token_auth.login_required
def update_user(id):
	user = User.query.get_or_404(id)
	data = request.get_json() or {}
	if 'username' in data and data['username'] != user.username and \
			User.query.filter_by(username=data['username'].lower()).first():
		return bad_request('username already exists')
	if 'email' in data and data['email'] != user.email and \
			User.query.filter_by(email=data['email'].lower()).first():
		return bad_request('email address already registered')
	user.from_dict(data, new_user=False)
	db.session.commit()
	return jsonify(user.to_dict())
