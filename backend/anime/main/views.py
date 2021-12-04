from flask import render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from .forms import EditProfileForm, SearchForm, PostForm
from .. import db
from datetime import datetime
from werkzeug.utils import secure_filename
from . import main
from ..models import User, Post
from .errors import page_not_found
from config import Config
import os
import random

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/home', methods=['POST', 'GET'])
@login_required
def home():
    results = db.session.query(User)
    resultt=[]
    form1 = SearchForm()
    form2 = PostForm()
    posts = current_user.followed_posts().all()
    
    if form1.search.data is True:  #if search button is pressed
        if form1.validate_on_submit():
            usrname = form1.username.data.lower()
            resultt= results.filter_by(username = usrname).all()
            if len(resultt) == 0:
                flash('User not found, please try again')

    if form2.newPost.data is True:   #if post button is pressed
        if form2.validate_on_submit(): 
            rcp = form2.recipe.data.lower()
            ingrdts = form2.ingrdts.data.lower()
            cksteps = form2.cksteps.data.lower()
            cktime = form2.cktime.data.lower()
        if 'picture' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['picture']
            # if user does not select file, browser also
            # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        elif file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(Config.UPLOAD_FOLDER, filename))
            flash('Image successfully uploaded and displayed below')
            new_post = Post(recipe=rcp, ingredients=ingrdts, cookingSteps=cksteps, cookingTime=cktime, image=filename, author=current_user)
            try:
                db.session.add(new_post)
                db.session.commit()
                return redirect('/home')
            except:
                return 'There was an error while uploading the post'
        else:
            flash('Allowed image types are - png, jpg, jpeg, gif')
            return redirect(request.url)
    
    return render_template('main/home.html', celeb=resultt, form1=form1, form2=form2, posts=posts)

@main.route('/editprofile', methods=['POST', 'GET'])
@login_required
def edit_profile():
    form = EditProfileForm()
    if form.validate_on_submit():
        print('here')
        current_user.name = form.name.data
        current_user.username = form.username.data.lower()
        current_user.about_me = form.about_me.data
        print(form.about_me.data)
        db.session.commit()
        flash('Your changes have been saved.')
        return redirect(url_for('main.edit_profile'))
    elif request.method == 'GET':
        form.name.data = current_user.name
        form.username.data = current_user.username
        form.about_me.data = current_user.about_me
    return render_template('main/profile.html', title='Edit Profile', form=form)

@main.route('/user/<username>')
@login_required
def user(username):
    user = User.query.filter_by(username=username).first_or_404()
    posts= user.posts.all()

    return render_template('user.html', user=user, posts=posts)

@main.before_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.utcnow()
        db.session.commit()
    
@main.route('/follow/<username>', methods=['POST'])
@login_required
def follow(username):
    if request.method == 'POST':
        user = User.query.filter_by(username=username).first()
        if user is None:
            flash('User {} not found.'.format(username))
            return redirect(url_for('main.profile'))
        if user == current_user:
            flash('You cannot follow yourself!')
            return redirect(url_for('main.user', username=username))
        current_user.follow(user)
        db.session.commit()
        flash('You are following {}!'.format(username))
        return redirect(url_for('main.user', username=username))
    else:
        return redirect(url_for('main.profile'))

@main.route('/unfollow/<username>', methods=['POST'])
@login_required
def unfollow(username):
    if request.method == 'POST':
        user = User.query.filter_by(username=username).first()
        if user is None:
            flash('User {} not found.'.format(username))
            return redirect(url_for('main.profile'))
        if user == current_user:
            flash('You cannot unfollow yourself!')
            return redirect(url_for('main.user', username=username))
        current_user.unfollow(user)
        db.session.commit()
        flash('You are not following {}.'.format(username))
        return redirect(url_for('main.user', username=username))
    else:
        return redirect(url_for('main.profile'))

@main.route('/explore', methods=['GET'])
@login_required
def explore():
    posts = Post.query.all()
    if len(posts) != 0:
        if len(posts) > 100:
            posts = random.sample(posts, k=50)
        else:
            posts = random.sample(posts, k=len(posts))
    return render_template('main/explore.html', posts=posts)
