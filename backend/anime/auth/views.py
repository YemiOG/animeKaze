from flask_login import login_user, logout_user, login_required, \
    current_user
from flask import render_template, redirect, url_for, request, flash
from . import auth
from .forms import RegistrationForm, LoginForm
from .. import db
from ..models import User
from .errors import forbidden
from flask import json

# from ..email import send_email


@auth.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = RegistrationForm()
    if form.validate_on_submit():                                           # then the email already exists in database
        user = User(email=form.email.data.lower(),
                    username=form.username.data.lower(),
                    name=form.name.data.lower())
        print(form.name.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('auth.login'))

    return render_template('auth/register.html', title='Register', form=form)


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data.lower()
        password = form.password.data
        user = User.query.filter_by(email=email).first()

    # check if the user actually exists
    # take the user-supplied password, hash it, and compare it to the hashed
    # password in the database
        if user is not None and user.check_password(password):
            login_user(user)
            return redirect(url_for('main.home'))
        else:
            flash('Please check your login details and try again.')
            return redirect(url_for('auth.login'))
            # if the user doesn't exist or password is wrong, reload the page
    return render_template('auth/login.html', title='Sign In', form=form)


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))
