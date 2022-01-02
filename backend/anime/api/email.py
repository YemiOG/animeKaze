from flask_mail import Message
from .. import mail
from flask import render_template

def send_email(subject, recipients, text_body):
    msg = Message(subject, recipients=recipients)
    msg.body = text_body
    mail.send(msg)

def send_password_reset_email(user):
	token = user.get_reset_password_token()
	send_email('[animeKaze] Reset Your Password',
				recipients=[user.email],
				text_body=render_template('reset_password.txt',
				user=user, token=token))
