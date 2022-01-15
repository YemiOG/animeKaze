from . import api
from flask import request,url_for
from sqlalchemy import or_
# from flask_cors import CORS, cross_origin
from flask_jwt_extended import jwt_required
from ..models import User, Post
from datetime import datetime
from .. import db
from .errors import bad_request
from cloudinary.uploader import upload
import random

@api.route('/upload', methods=['POST'])
@jwt_required()
# @cross_origin()
def upload_file():
	response = None
	post_time = datetime.utcnow() #set time post was submitted 
	#get post content from POST request
	post = request.form['content']
	user_id = request.form['uid']
	if 'file' not in request.files:
		return bad_request('No image attached')
	file_to_upload = request.files['file']
	current_user = User.query.get_or_404(user_id)
	#upload media file to cloudinary 
	if not file_to_upload:
		return bad_request('Post failed, please try again')
	upload_result = upload(file_to_upload, eager= [
	{	"width": 400, 
		"height": 300,
		"crop": "fit"
	}])
	response = {"success":'New post successfully created'}
		
	#and then get the url for the transitioned uploaded file and store it in the database
	file= response.get('eager')
	file_url= file[0].get('secure_url')
	new_post = Post(content=post, image=file_url, 
					timestamp=post_time,
					author=current_user)
	db.session.add(new_post)
	db.session.commit()
	return response

@api.route('/search', methods=['POST'])
def search_user():
	usrname = request.json.get("username", None).lower()
	print(usrname)
	user = User.query.filter(or_(User.username == usrname, User.first_name == usrname, User.last_name == usrname)).first()
	response=user.to_dict()
	return response

# User posts only
@api.route('/<pager>/<username>/posts', methods=['GET'])
def get_posts(username,pager):
	response = None
	user = User.query.filter_by(username=username).first_or_404()
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	if pager == 'profile':
		response = User.to_collection_dict(user.posts, page, per_page, 
										'api.get_posts', username=username, pager=pager)
	elif pager == 'home':
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
	user = User.query.filter_by(username=username).first_or_404()
	if user == currentUser:
		return bad_request('You cannot unfollow yourself')
	currentUser.unfollow(user)
	db.session.commit()
	response = {"success":'You have unfollowed {}!'.format(username)}
	return response

@api.route('/likepost/<id>', methods=['POST'])
@jwt_required()
def like(id):
	uzer = request.json.get("username").lower()
	user = User.query.filter_by(username=uzer).first_or_404()
	#Get current user that liked the post
	Post_liked = Post.query.filter_by(id=id).first_or_404()
	#Check if user has liked the picture before with the "like_state function"
	Post_liked.like_state(user)
	db.session.commit()
	response = {"success": 'Post reacted to'}
	return response

