from . import api
from flask import request,url_for,jsonify
from flask_jwt_extended import jwt_required
from ..models import User
from .. import db
from .errors import bad_request


@api.route('/profile', methods=['POST'])
def user_profile():
	data = request.get_json() or {}
	if 'username' not in data:
		return bad_request('Please choose a username')
	if User.query.filter_by(username=data['username'].lower()).first():
		return bad_request('Username not available')
	user = User()
	user.from_dict(data)
	db.session.add(user)
	db.session.commit()
	response = jsonify(user.to_dict())
	response.status_code = 201
	response.headers['Location'] = url_for('api.get_user', id=user.id)
	return response

@api.route('/user/<username>', methods=['POST'])
def get_user(username):
	following = False
	if(request.json.get("username")):
		currentUzer = request.json.get("username").lower()
		currentUser = User.query.filter_by(username=currentUzer).first_or_404()
		uzer = User.query.filter_by(username=username).first_or_404()
		if currentUser.is_following(uzer):
			following = True
		response = {
			"user":uzer.to_dict(),
			"following":following
			}
	else:
		response = {
			"user":User.query.filter_by(username=username).first_or_404().to_dict(),
			"following":following
			}
	return response

@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	response = User.to_collection_dict(User.query, page, per_page, 'api.get_users')
	return response

@api.route('/user/<username>/followers', methods=['POST'])
@jwt_required()
def get_followers(username):
	following = []
	if(request.json.get("username")):
		currentUzer = request.json.get("username").lower()
		currentUser = User.query.filter_by(username=currentUzer).first_or_404()
		user = User.query.filter_by(username=username).first_or_404()

	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	userData = User.to_collection_dict(user.followers, page, per_page,
                                   'api.get_followers', username=username)
	for follow in userData['items']:
		flw= follow['username']
		follower= User.query.filter_by(username=flw).first_or_404()
		following.append(currentUser.is_following(follower))

	response = {
			"user":userData,
			"following":following
		}
	return response

@api.route('/user/<username>/followed', methods=['POST'])
@jwt_required()
def get_followed(username):
	following = []
	if(request.json.get("username")):
		currentUzer = request.json.get("username").lower()
		currentUser = User.query.filter_by(username=currentUzer).first_or_404()
		user = User.query.filter_by(username=username).first_or_404()
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	userData = User.to_collection_dict(user.followed, page, per_page,
                                   'api.get_followed', username=username)
	for follow in userData['items']:
		flw= follow['username']
		follower= User.query.filter_by(username=flw).first_or_404()
		following.append(currentUser.is_following(follower))
		
	response = {
			"user":userData,
			"following":following
		}
	return response

@api.route('/user/<username>', methods=['PUT'])
@jwt_required()
def update_user(username):
	data = request.get_json() or {}
	if int(data['id']) != id:
		return bad_request('unauthorized')

	user = User.query.get_or_404(id)
	if 'username' in data and data['username'] != user.username and \
			User.query.filter_by(username=data['username'].lower()).first():
		return bad_request('username already exists')
	if 'email' in data and data['email'] != user.email and \
			User.query.filter_by(email=data['email'].lower()).first():
		return bad_request('email address already registered')
	user.from_dict(data, new_user=False)
	db.session.commit()
	response = user.to_dict()
	return response



