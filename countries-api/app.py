from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import requests
import secrets
import hashlib
from datetime import datetime, timedelta
from functools import wraps
import os
import re

app = Flask(__name__)
app.secret_key = os.environ.get(
    'SECRET_KEY', '')

# Database initialization
database_name = os.environ.get('DATABASE_NAME', 'countries_api.db')
def init_db():
    conn = sqlite3.connect(database_name)
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
        )
    ''')

    # API Keys table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            key_name VARCHAR(100) NOT NULL,
            key_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_used TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            usage_count INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # API Usage tracking table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key_id INTEGER NOT NULL,
            endpoint VARCHAR(255) NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            response_status INTEGER,
            FOREIGN KEY (api_key_id) REFERENCES api_keys (id)
        )
    ''')

    conn.commit()
    conn.close()

# Security decorators
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


def api_key_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({'error': 'API key required', 'status': 401}), 401

        # Validate API key
        conn = sqlite3.connect(database_name)
        cursor = conn.cursor()

        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        cursor.execute('''
            SELECT ak.id, ak.user_id, u.username 
            FROM api_keys ak 
            JOIN users u ON ak.user_id = u.id 
            WHERE ak.key_hash = ? AND ak.is_active = TRUE AND u.is_active = TRUE
        ''', (key_hash,))

        result = cursor.fetchone()
        if not result:
            conn.close()
            return jsonify({'error': 'Invalid API key', 'status': 401}), 401

        # Update usage statistics
        cursor.execute('''
            UPDATE api_keys 
            SET last_used = CURRENT_TIMESTAMP, usage_count = usage_count + 1 
            WHERE id = ?
        ''', (result[0],))

        # Log API usage
        cursor.execute('''
            INSERT INTO api_usage (api_key_id, endpoint, ip_address, user_agent) 
            VALUES (?, ?, ?, ?)
        ''', (result[0], request.endpoint, request.remote_addr, request.headers.get('User-Agent')))

        conn.commit()
        conn.close()

        request.api_key_info = {
            'id': result[0], 'user_id': result[1], 'username': result[2]}
        return f(*args, **kwargs)
    return decorated_function

# Input validation functions
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_username(username):
    return len(username) >= 3 and username.isalnum()


def sanitize_input(text):
    return text.strip() if text else ''

# RestCountries API integration
def fetch_country_data(country_name=None):
    try:
        if country_name:
            # Search for specific country
            url = f"https://restcountries.com/v3.1/name/{country_name}?fields=name,currencies,capital,languages,flags"
        else:
            # Get all countries
            url = "https://restcountries.com/v3.1/all?fields=name,currencies,capital,languages,flags"

        response = requests.get(url, timeout=10)
        response.raise_for_status()

        countries_data = response.json()
        print(url)
        filtered_data = []

        for country in countries_data:
            filtered_country = {
                'name': country.get('name', {}).get('common', 'N/A'),
                'official_name': country.get('name', {}).get('official', 'N/A'),
                'capital': country.get('capital', ['N/A'])[0] if country.get('capital') else 'N/A',
                'currencies': country.get('currencies', {}),
                'languages': country.get('languages', {}),
                'flag': country.get('flags', {}).get('png', 'N/A')
            }

            # Extract currencies
            if country.get('currencies'):
                for code, currency in country['currencies'].items():
                    filtered_country['currencies'][code] = {
                        'name': currency.get('name', 'N/A'),
                        'symbol': currency.get('symbol', 'N/A')
                    }

            # Extract languages
            if country.get('languages'):
                filtered_country['languages'] = country['languages']

            filtered_data.append(filtered_country)

        return filtered_data

    except requests.exceptions.RequestException as e:
        return {'error': f'External API error: {str(e)}'}
    except Exception as e:
        return {'error': f'Data processing error: {str(e)}'}

# Web Routes


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = sanitize_input(request.form.get('username'))
        email = sanitize_input(request.form.get('email'))
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Validation
        if not validate_username(username):
            flash('Username must be at least 3 characters and alphanumeric only')
            return render_template('register.html')

        if not validate_email(email):
            flash('Please enter a valid email address')
            return render_template('register.html')

        if len(password) < 8:
            flash('Password must be at least 8 characters long')
            return render_template('register.html')

        if password != confirm_password:
            flash('Passwords do not match')
            return render_template('register.html')

        # Check if user exists
        conn = sqlite3.connect(database_name)
        cursor = conn.cursor()
        cursor.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
        if cursor.fetchone():
            flash('Username or email already exists')
            conn.close()
            return render_template('register.html')

        # Create user
        password_hash = generate_password_hash(password)
        cursor.execute('''
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        ''', (username, email, password_hash))

        conn.commit()
        conn.close()

        flash('Registration successful! Please log in.')
        return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = sanitize_input(request.form.get('username'))
        password = request.form.get('password')

        conn = sqlite3.connect(database_name)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, username, password_hash 
            FROM users 
            WHERE username = ? AND is_active = TRUE
        ''', (username,))

        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user[2], password):
            session['user_id'] = user[0]
            session['username'] = user[1]
            flash('Login successful!')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out')
    return redirect(url_for('index'))


@app.route('/dashboard')
@login_required
def dashboard():
    conn = sqlite3.connect(database_name)
    cursor = conn.cursor()

    # Get user's API keys
    cursor.execute('''
        SELECT id, key_name, created_at, last_used, usage_count, is_active
        FROM api_keys 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ''', (session['user_id'],))

    api_keys = cursor.fetchall()
    conn.close()

    return render_template('dashboard.html', api_keys=api_keys)


@app.route('/create_api_key', methods=['POST'])
@login_required
def create_api_key():
    key_name = sanitize_input(request.form.get('key_name'))

    if not key_name or len(key_name) < 3:
        flash('API key name must be at least 3 characters long')
        return redirect(url_for('dashboard'))

    # Generate API key
    api_key = secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()

    conn = sqlite3.connect(database_name)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO api_keys (user_id, key_name, key_hash) 
        VALUES (?, ?, ?)
    ''', (session['user_id'], key_name, key_hash))

    conn.commit()
    conn.close()

    flash(f'API Key created successfully: {api_key}')
    return redirect(url_for('dashboard'))


@app.route('/toggle_api_key/<int:key_id>')
@login_required
def toggle_api_key(key_id):
    conn = sqlite3.connect(database_name)
    cursor = conn.cursor()

    # Verify ownership and toggle
    cursor.execute('''
        UPDATE api_keys 
        SET is_active = NOT is_active 
        WHERE id = ? AND user_id = ?
    ''', (key_id, session['user_id']))

    if cursor.rowcount > 0:
        flash('API key status updated')
    else:
        flash('API key not found')

    conn.commit()
    conn.close()

    return redirect(url_for('dashboard'))

# API Routes


@app.route('/api/countries', methods=['GET'])
@api_key_required
def get_all_countries():
    try:
        countries = fetch_country_data()
        if isinstance(countries, dict) and 'error' in countries:
            return jsonify(countries), 500

        return jsonify({
            'status': 'success',
            'count': len(countries),
            'data': countries
        })
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}', 'status': 500}), 500


@app.route('/api/countries/<country_name>', methods=['GET'])
@api_key_required
def get_country_by_name(country_name):
    try:
        # Sanitize country name
        country_name = sanitize_input(country_name)
        if not country_name:
            return jsonify({'error': 'Country name is required', 'status': 400}), 400

        countries = fetch_country_data(country_name)
        if isinstance(countries, dict) and 'error' in countries:
            return jsonify(countries), 404

        return jsonify({
            'status': 'success',
            'count': len(countries),
            'data': countries
        })
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}', 'status': 500}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Countries API Middleware'
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Endpoint not found', 'status': 404}), 404
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Internal server error', 'status': 500}), 500
    return render_template('500.html'), 500


if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
