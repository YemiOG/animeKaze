from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, \
                    ValidationError
from wtforms.validators import DataRequired, Length, Email, Regexp, EqualTo
from ..models import User


class RegistrationForm(FlaskForm):
    name = StringField('Name',
                       validators=[DataRequired(), Length(1, 64)])
    username = StringField('Username', validators=[
        DataRequired(), Length(1, 64),
        Regexp('^[A-Za-z][A-Za-z0-9_.]*$', 0,
               'Usernames must have only letters, numbers, dots or '
               'underscores')])
    email = StringField('Email Address',
                        validators=[DataRequired(), Length(1, 64),
                                    Email()])
    password = PasswordField('Password', validators=[
        DataRequired(), EqualTo('password2', message='Passwords must match.')])
    password2 = PasswordField('Repeat Password', validators=[DataRequired()])
    submit = SubmitField('Register')

    def validate_email(self, field):
        user = User.query.filter_by(email=field.data.lower()).first()
        if user is not None:
            raise ValidationError('Email already registered.')

    def validate_username(self, field):
        user = User.query.filter_by(username=field.data.lower()).first()
        if user is not None:
            raise ValidationError('Username already in use.')

    # if a user is found, we want to redirect back to signup page
    # so user can try again


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Length(1, 64),
                                             Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')
