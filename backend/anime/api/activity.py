from . import api
from flask import request,url_for
# from flask_cors import CORS, cross_origin
from flask_jwt_extended import jwt_required
from ..models import User, Post
from datetime import datetime
from .. import db
from .errors import bad_request
import cloudinary.uploader
import random

@api.route('/upload', methods=['POST'])
@jwt_required()
# @cross_origin()
def upload_file():
	upload_result = None
	postTime = datetime.utcnow()
	if request.method == 'POST':
		post = request.form['content']
		user = request.form['uid']
		if 'file' not in request.files:
			return bad_request('No image attached')
		file_to_upload = request.files['file']
		current_user = User.query.get_or_404(user)
		if file_to_upload:
			upload_result = cloudinary.uploader.upload(file_to_upload)
			response = upload_result
			filename= response.get('secure_url')
			new_post = Post(content=post, image=filename, 
							timestamp=postTime,
							author=current_user)
			db.session.add(new_post)
			db.session.commit()
			return response

@api.route('/search', methods=['POST'])
def search_user():
	usrname = request.json.get("username", None).lower()
	user = User.query.filter_by(username = usrname).first_or_404().to_dict()
	if user is None:
		user = User.query.filter_by(first_name == usrname).first_or_404().to_dict()
	if user is None:
		user = User.query.filter(User.last_name == usrname).first_or_404().to_dict()
	response=user
	return response

# User posts only
@api.route('/<pager>/<username>/posts', methods=['GET'])
# @jwt_required()
def get_posts(username,pager):
	response = None
	user = User.query.filter_by(username=username).first_or_404()
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	if pager == 'home':
		response = User.to_collection_dict(user.posts, page, per_page, 
										'api.get_posts', username=username, pager=pager)
	elif pager == 'profile':
		response = User.to_collection_dict(user.followed_posts(), page, per_page, 
											'api.get_posts', username=username, pager=pager)
	return response

@api.route('/explore', methods=['GET'])
@jwt_required()
def explore():
	posts = Post.query.order_by(Post.timestamp.desc()).all()
	if len(posts) != 0:
		posts = random.sample(posts, k=len(posts))
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	response = Post.to_collection_dict(Post.query, page, per_page, 
										'api.explore')
	return response

@api.route('/follow/<username>', methods=['POST'])
@jwt_required()
def follow(username):
	currentUzer = request.json.get("username", None).lower()
	currentUser = User.query.filter_by(username=currentUzer).first_or_404()
	if request.method == 'POST':
		user = User.query.filter_by(username=username).first_or_404()
		if user == currentUser:
			return bad_request('You cannot follow yourself')
		currentUser.follow(user)
		db.session.commit()
		response = {"success":'You are now following {}!'.format(username)}
		return response


@api.route('/unfollow/<username>', methods=['POST'])
@jwt_required()
def unfollow(username):
	currentUzer = request.json.get("username", None).lower()
	currentUser = User.query.filter_by(username=currentUzer).first_or_404()
    if request.method == 'POST':
        user = User.query.filter_by(username=username).first_or_404()
        if user == currentUser:
			return bad_request('You cannot unfollow yourself')
        currentUser.unfollow(user)
        db.session.commit()
		response = {"success":'You have unfollowed {}!'.format(username)}
		return response
