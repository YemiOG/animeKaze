from . import api
from flask import request
from sqlalchemy import or_
# from flask_cors import CORS, cross_origin
from flask_jwt_extended import jwt_required
from ..models import User, Post, Comment, ChildComment, Notification
from datetime import datetime
from .. import db
from .errors import bad_request
from cloudinary.uploader import upload


@api.route('/upload', methods=['POST'])
@jwt_required()
# @cross_origin()
def upload_file():
	# set time post was submitted
	post_time = datetime.utcnow()

	#get post content from POST request
	post = request.form['content']
	user_id = request.form['uid']
	
	#confirm that a file was sent with the POST request
	if 'file' not in request.files:
		return bad_request('No image attached')
	file_to_upload = request.files['file']

	#get current user
	current_user = User.query.get_or_404(user_id)

	#upload media file to cloudinary
	if not file_to_upload:
		return bad_request('Post failed, please try again')

	upload_result = upload(file_to_upload, 
		folder = "Posts/", 
		public_id = file_to_upload.filename)

	# upload_result = upload(file_to_upload, eager=[
	# {	"width": 385,
    # 	"height": 180,
	# 	"crop": "fit"
	# }])

	response = {"success": 'New post successfully created'}
		
	# and then get the url for the transitioned uploaded file and store it in the database
	file= upload_result.get('secure_url')
	# file_url= file[0].get('secure_url')

	# finally store the new post in the db
	new_post = Post(content=post, image=file, 
					timestamp=post_time,
					username= current_user.username,
					author=current_user)
	db.session.add(new_post)
	db.session.commit()
	return response

@api.route('/search', methods=['POST'])
def search_user():
	usrname = request.json.get("username", None).lower()
	user = User.query.filter(or_(User.username == usrname, User.first_name == usrname, User.last_name == usrname))
	# print(user.all())
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	response = User.to_collection_dict(user, page, per_page, 'api.search_user')
	return response


@api.route('/profile/<username>/posts', methods=['GET'])
@jwt_required()
def get_profile_posts(username):
	# get current user
    user = User.query.filter_by(username=username).first_or_404()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    # Display user's posts only
    response = User.to_collection_dict(user.posts, page, per_page,
                                       'api.get_profile_posts',
										username=username)
    return response

@api.route('/notification/post', methods=['POST'])
@jwt_required()
def get_single_post():
	#Get id of post
	post_id = request.json.get("pid")

	#Get the post by its id
	post = Post.query.filter_by(id=post_id).first_or_404()

    # Display user's posts only
	response = post.to_dict()

	return response

@api.route('/notification/comment', methods=['POST'])
@jwt_required()
def get_single_comment():
	#Get id of post
	comment_id = request.json.get("cid")
	print(comment_id)
	#Get the post by its id
	comment = Comment.query.filter_by(id=comment_id).first_or_404()

    # Display user's posts only
	response = comment.to_dict()

	return response


@api.route('/home/<username>/posts', methods=['GET'])
@jwt_required()
def get_home_posts(username):
	# Get current user
	user = User.query.filter_by(username=username).first_or_404()
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	

    # Display user's + followed users' posts
	response = User.to_collection_dict(user.followed_posts(), page, per_page,
                                       'api.get_home_posts',
									    username=username)
	return response


@api.route('/explore', methods=['POST'])
@jwt_required()
def explore():
	# get current user
	usrname = request.json.get("username", None).lower()
	user = User.query.filter_by(username=usrname).first_or_404()

	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	# filter posts and return only the posts user has not marked as not interested
	response = User.to_collection_dict(user.filter_posts(), page, per_page,
									   'api.explore')
	return response


@api.route('/follow/<username>', methods=['POST'])
@jwt_required()
def follow(username):
	# set current time
	follow_time = datetime.utcnow()

	# Get current user
	currentUzer = request.json.get("username", None).lower()
	currentUser = User.query.filter_by(username=currentUzer).first_or_404()
	# Get user to be followed
	user = User.query.filter_by(username=username).first_or_404()
	if user == currentUser:
		return bad_request('You cannot follow yourself')
	notify = currentUser.follow(user)
	db.session.commit()

	#create new notification if user is followed
	if notify == True:
		new_notf = Notification(timestamps=follow_time, 
								username= currentUser.username,
								followed_user_id= user.id,
								author=currentUser)
		db.session.add(new_notf)
		db.session.commit()
		new_notf.follow_notification(user)
		db.session.commit()

	response = {"success":'You are now following {}!'.format(username)}
	return response


@api.route('/unfollow/<username>', methods=['POST'])
@jwt_required()
def unfollow(username):
	#Get current user 
	currentUzer = request.json.get("username", None).lower()
	currentUser = User.query.filter_by(username=currentUzer).first_or_404()
	#Get user to be unfollowed 
	user = User.query.filter_by(username=username).first_or_404()
	if user == currentUser:
		return bad_request('You cannot unfollow yourself')
	notify = currentUser.unfollow(user)
	db.session.commit()

	#delete notification if like action is reversed
	if notify == True:
		notific = Notification.query.filter_by(user_id = currentUser.id, followed_user_id = user.id ).first_or_404()
		notific.delete_follow_notification(user)
		db.session.commit()

	response = {"success":'You have unfollowed {}!'.format(username)}
	return response

@api.route('/likepost/<id>', methods=['POST'])
@jwt_required()
def like(id):
	# set time post was liked
	like_time = datetime.utcnow()

	#Get current user that liked the post
	uzer = request.json.get("username").lower()
	user = User.query.filter_by(username=uzer).first_or_404()

	#Get the liked post by its id
	Post_liked = Post.query.filter_by(id=id).first_or_404()

	# print(Post_liked.liked_by_user)
	#Check if user has previously liked the picture with the "like_state" function
	#If true, unlike the post  #If false, like the post
	notify = Post_liked.like_state(user)
	db.session.commit()
	#create new notification if post is liked
	if notify == True:
		new_notf = Notification(timestamps=like_time, 
								username= user.username,
								post = Post_liked,
								post_creator_id= Post_liked.user_id,
								author=user)
		db.session.add(new_notf)
		db.session.commit()
		new_notf.like_post_notify(Post_liked)
		db.session.commit()

	#delete notification if like action is reversed
	elif notify == False:
		notific = Notification.query.filter_by(post_id = id, user_id = user.id).first_or_404()
		notific.delete_like_post_notify(Post_liked)
		db.session.commit()

	response = {"success": True}
	return response

@api.route('/notinterested/<id>', methods=['POST'])
@jwt_required()
def not_interested(id):
	#Get current user that wants to stop seeing the particular post
	uzer = request.json.get("username").lower()
	user = User.query.filter_by(username=uzer).first_or_404()

	#Get the particular post the user wants to stop seeing
	Posts = Post.query.filter_by(id=id).first_or_404()

	#Add user to list of people not interested in this post
	Posts.no_interest(user)
	db.session.commit()
	response = {"success": True}
	return response

@api.route('/report/<id>', methods=['POST'])
@jwt_required()
def report(id):
	#Get current user that is reporting a particular post
	uzer = request.json.get("username").lower()
	user = User.query.filter_by(username=uzer).first_or_404()

	#Get the particular post being reported
	Post_reported = Post.query.filter_by(id=id).first_or_404()

	#Add user to list of people who have reported this posts
	Post_reported.report(user)
	db.session.commit()
	response = {"success": True}
	return response

@api.route('/comment', methods=['GET','POST'])
@jwt_required()
def commenting():
	#set time comment was submitted 
	comment_time = datetime.utcnow() 
	#get comment, userId and postId from POST request
	comment = request.json.get('content')
	user_id = request.json.get('uid')
	post_id = request.json.get('pid')
	#get current user
	current_user = User.query.get_or_404(user_id)
	#get post 
	Posts = Post.query.filter_by(id=post_id).first_or_404()

	#finally store the new comment in the db
	new_comment = Comment(content=comment,
							post = Posts,
							timestamps=comment_time,
							username= current_user.username,
							author=current_user)
	db.session.add(new_comment)
	db.session.commit()

	#create new notification for new comment
	new_notf = Notification(timestamps=comment_time, 
							username= current_user.username,
							post = Posts,
							comment_post_author_id = Posts.user_id,
							author=current_user)

	db.session.add(new_notf)
	db.session.commit()
	new_notf.comment_post_notification(Posts)
	db.session.commit()

	response = {"success": True}
	return response

@api.route('/child/comment', methods=['POST'])
@jwt_required()
def child_commenting():
	#set time comment was submitted 
	comment_time = datetime.utcnow() 

	#get comment content, userId and postId from POST request
	content = request.json.get('content')
	user_id = request.json.get('uid')
	comment_id = request.json.get('cid')

	#get current user
	current_user = User.query.get_or_404(user_id)
	#get comment 
	comment = Comment.query.filter_by(id=comment_id).first_or_404()

	#finally store the new comment in the db
	new_comment = ChildComment(content=content,
						comment= comment,
						timestamps=comment_time,
						username= current_user.username,
						author=current_user)
	db.session.add(new_comment)
	db.session.commit()

	#create new notification for new comment
	new_notf = Notification(timestamps=comment_time, 
							username= current_user.username,
							comment= comment,
							child_comment_author_id = comment.user_id,
							author=current_user)

	db.session.add(new_notf)
	db.session.commit()
	new_notf.comment_child_notification(comment)
	db.session.commit()

	response = {"success": True}
	return response

@api.route('/post/comments', methods=['POST'])
def get_comments():	
	#get postId from POST request
	post_id = request.json.get('pid')	
	#get post 
	post = Post.query.filter_by(id=post_id).first_or_404()
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
    # Display all comments attached to post
	response = Post.to_collection_dict(post.comments, page, per_page, 
                                    'api.get_comments')
	return response

@api.route('/comment/comments', methods=['POST'])
def get_child_comments():	
	#get id of the comment from POST request
	comment_id = request.json.get('cid')	
	#get comment 
	comment = Comment.query.filter_by(id=comment_id).first_or_404()
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
    # Display all comments attached to particular comment
	response = Comment.to_collection_dict(comment.comments, page, per_page, 
                                          'api.get_child_comments')
	return response

@api.route('/likecomment/<id>', methods=['POST'])
@jwt_required()
def likeComment(id):
	#set time comment was liked 
	comment_time = datetime.utcnow() 

	#Get current user that liked the comment
	uzer = request.json.get("username").lower()
	user = User.query.filter_by(username=uzer).first_or_404()

	#Get the liked comment by its id
	Comment_liked = Comment.query.filter_by(id=id).first_or_404()

	#Check if user has liked the comment before with the "like_comment_state" function
	#Then like or unlike based on the response to the check
	notify = Comment_liked.like_comment_state(user)
	db.session.commit()

	#create new notification if comment is liked
	if notify == True:
		new_notf = Notification(timestamps=comment_time, 
								username= user.username,
								comment = Comment_liked,
								comment_creator_id= Comment_liked.user_id,
								author=user)
		db.session.add(new_notf)
		db.session.commit()
		new_notf.like_comment_notify(Comment_liked)
		db.session.commit()

	#delete notification if like action is reversed
	elif notify == False:
		notific = Notification.query.filter_by(comment_id = id, user_id = user.id).first_or_404()
		notific.delete_like_comment_notify(Comment_liked)
		db.session.commit()

	response = {"success": True}
	return response

@api.route('/likechildcomment/<id>', methods=['POST'])
@jwt_required()
def likeChildComment(id):
	#set time comment was submitted 
	comment_time = datetime.utcnow() 
	#Get current user that liked the comment
	uzer = request.json.get("username").lower()
	user = User.query.filter_by(username=uzer).first_or_404()

	#Get the liked child comment by its id
	comment = ChildComment.query.filter_by(id=id).first_or_404()
	#Check if user has liked the comment before with the "like_child_comment" function
	#Then like or unlike based on the response to the check
	notify = comment.like_child_comment(user)
	db.session.commit()

	#create new notification if comment is liked
	if notify == True:
		new_notf = Notification(timestamps=comment_time, 
								username= user.username,
								childcomment = comment,
								child_comment_creator_id= comment.user_id,
								author=user)
		db.session.add(new_notf)
		db.session.commit()
		new_notf.like_ch_comment_notify(comment)
		db.session.commit()

	#delete notification if like action is reversed
	elif notify == False:
		notific = Notification.query.filter_by(child_comment_id = id, user_id = user.id).first_or_404()
		notific.delete_like_ch_comment_notify(comment)
		db.session.commit()

	response = {"success": True}
	return response

@api.route('/notifications', methods=['POST'])
@jwt_required()
def notify():
	#set time action was made 
	action_time = datetime.utcnow() 
	
	# #get comment, userId and postId from POST request
	# comment = request.json.get('content')
	# user_id = request.json.get('uid')
	# post_id = request.json.get('pid')

	# Get current user
	uzer = request.json.get("username").lower()
	user = User.query.filter_by(username=uzer).first_or_404()

	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)

    # Display notifications
	response = User.to_collection_dict(user.get_notifications(), page, per_page,
                                       'api.notify')
	return response
