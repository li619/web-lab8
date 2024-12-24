from flask import Flask, render_template, jsonify, request
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user, logout_user
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Score
from config import Config

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'  # 可以改成任何随机字符串
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
@login_required
def game():
    return render_template('game.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
        
        user = User(username=username, password=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('index'))
        
        flash('Invalid username or password')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/save_score', methods=['POST'])
@login_required
def save_score():
    data = request.get_json()
    score_value = data.get('score')
    
    score = Score(score=score_value, user_id=current_user.id)
    db.session.add(score)
    db.session.commit()
    
    return jsonify({'message': 'Score saved successfully'})

@app.route('/get_scores')
@login_required
def get_scores():
    scores = Score.query.filter_by(user_id=current_user.id).order_by(Score.date.desc()).all()
    return jsonify([{
        'score': score.score,
        'date': score.date.strftime('%Y-%m-%d %H:%M:%S')
    } for score in scores])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 