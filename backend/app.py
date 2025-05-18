from flask import Flask, redirect, url_for, session, jsonify, request
from authlib.integrations.flask_client import OAuth
from authlib.common.security import generate_token
import os
import requests
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
app.secret_key = os.urandom(24)
api_key = os.getenv('NYT_API_KEY')
CORS(app)

oauth = OAuth(app)
try: 
    client = MongoClient('mongodb://mongo:27017/', username='root', password='rootpassword')
    client.admin.command('ping')
    print('successfully connected')
except Exception as e: 
    print("error, connecting: {e}")
    client = None


# Create database named demo if they don't exist already
db = client['mydatabase']

# Create collection named data if it doesn't exist already
collection = db['comments']

nonce = generate_token()


oauth.register(
    name=os.getenv('OIDC_CLIENT_NAME'),
    client_id=os.getenv('OIDC_CLIENT_ID'),
    client_secret=os.getenv('OIDC_CLIENT_SECRET'),
    #server_metadata_url='http://dex:5556/.well-known/openid-configuration',
    authorization_endpoint="http://localhost:5556/auth",
    token_endpoint="http://dex:5556/token",
    jwks_uri="http://dex:5556/keys",
    userinfo_endpoint="http://dex:5556/userinfo",
    device_authorization_endpoint="http://dex:5556/device/code",
    client_kwargs={'scope': 'openid email profile'}
)

@app.route('/')
def home():
    user = session.get('user')
    if user:
        return f"<h2>Logged in as {user['email']}</h2><a href='/logout'>Logout</a>"
    return '<a href="/login">Login with Dex</a>'

@app.route('/login')
def login():
    session['nonce'] = nonce
    redirect_uri = 'http://localhost:8000/authorize'
    return oauth.flask_app.authorize_redirect(redirect_uri, nonce=nonce)

@app.route('/authorize')
def authorize():
    token = oauth.flask_app.authorize_access_token()
    nonce = session.get('nonce')

    user_info = oauth.flask_app.parse_id_token(token, nonce=nonce)  # or use .get('userinfo').json()
    session['user'] = user_info
    return redirect('/')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/getArticles')
def get_article():
    try:
        response = requests.get(f'https://api.nytimes.com/svc/search/v2/articlesearch.json?q="Sacramento" or "Davis"&api-key={api_key}')
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/fetchComments')
def get_comments():
    try:
        comments = list(collection.find({}, {'_id': 0}))  
        return jsonify(comments)
    except Exception as e: 
        return jsonify({'error': str(e)}), 500

@app.route('/addComment', methods=['POST'])
def add_comment():
    data = request.get_json()
    
    collection.insert_one(data)

    return jsonify("data added")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
