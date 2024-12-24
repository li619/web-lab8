from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user, logout_user
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
import os
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')
app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb+srv://Morry:<morry>@morry.e1jrs.mongodb.net/?retryWrites=true&w=majority&appName=Morry')

mongo = PyMongo(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.username = user_data['username']
        self.password = user_data['password']

@login_manager.user_loader
def load_user(user_id):
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    return User(user_data) if user_data else None

@app.route('/')
def index():
    if current_user.is_authenticated:
        return render_template('game.html')
    return redirect(url_for('login'))

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

# 初始化数据库
def init_db():
    with app.app_context():
        db.create_all()

# 确保数据库存在
init_db()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 

# 重新部署