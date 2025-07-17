# Countries API Middleware

A secure API middleware service that interfaces with RestCountries.com, providing access to country data with authentication and security measures.

## Features

### Security Implementation

-   **API Key Authentication**: Secure key generation and validation
-   **Password Hashing**: Using Werkzeug's secure password hashing
-   **Session Management**: Secure user session handling
-   **Input Validation**: Comprehensive input sanitization and validation
-   **SQL Injection Protection**: Parameterized queries throughout
-   **Rate Limiting**: Usage tracking and monitoring

### API Features

-   **REST API Integration**: Seamless integration with RestCountries.com
-   **Data Filtering**: Returns only essential country information:
    -   Country name (common and official)
    -   Currency information (name and symbol)
    -   Capital city
    -   Spoken languages
    -   National flag
-   **Error Handling**: Robust error handling with meaningful responses
-   **JSON Format**: Consistent, well-structured JSON responses

### Data Management

-   **SQLite Database**: Normalized database schema (3NF)
-   **Usage Tracking**: Comprehensive API usage analytics
-   **User Management**: Complete user registration and authentication system

### Admin Features

-   **Web Interface**: User-friendly dashboard for API key management
-   **Key Management**: Create, activate, deactivate API keys
-   **Usage Statistics**: Monitor API usage and performance

## Project Structure

```
countries-api/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
├── docker-compose.yml    # Development environment
├── .env.example          # Environment variables template
├── README.md             # This file
└── templates/            # HTML templates
    ├── base.html         # Base template with Bootstrap
    ├── index.html        # Landing page
    ├── register.html     # User registration
    ├── login.html        # User login
    ├── dashboard.html    # API key management
    ├── 404.html          # Not found error
    └── 500.html          # Server error
```

## API Documentation

### Authentication

All API endpoints (except `/api/health`) require authentication using an API key in the request header:

```bash
X-API-Key: YOUR_API_KEY
```

### Endpoints

#### GET /api/health

**Description**: Service health check  
**Authentication**: Not required  
**Response**:

```json
{
	"status": "healthy",
	"timestamp": "2025-07-01T12:00:00",
	"service": "Countries API Middleware"
}
```

#### GET /api/countries

**Description**: Retrieve all countries with filtered data  
**Authentication**: Required  
**Response**:

```json
{
	"status": "success",
	"count": 195,
	"data": [
		{
			"name": "Germany",
			"official_name": "Federal Republic of Germany",
			"capital": "Berlin",
			"currencies": {
				"EUR": {
					"name": "Euro",
					"symbol": "€"
				}
			},
			"languages": {
				"deu": "German"
			},
			"flag": "https://flagcdn.com/w320/de.png"
		}
	]
}
```

#### GET /api/countries/{name}

**Description**: Search for specific country by name  
**Authentication**: Required  
**Parameters**:

-   `name` (string): Country name to search for

**Example**:

```bash
curl -H "X-API-Key: YOUR_API_KEY" \
     http://localhost:5000/api/countries/germany
```

## Security Features

### Password Security

-   **Hashing**: Werkzeug's PBKDF2 with SHA-256
-   **Salt**: Automatic salt generation
-   **Minimum Length**: 8 characters required

### API Key Security

-   **Generation**: Cryptographically secure random tokens (32 bytes)
-   **Storage**: SHA-256 hashed keys in database
-   **Validation**: Constant-time comparison to prevent timing attacks

### Input Validation

-   **Email Validation**: Regex pattern matching
-   **Username Validation**: Alphanumeric characters only
-   **SQL Injection Protection**: Parameterized queries
-   **XSS Prevention**: Input sanitization

### Session Management

-   **Secure Sessions**: Flask's secure session handling
-   **Session Timeout**: Automatic session expiration
-   **CSRF Protection**: Built-in Flask-WTF protection

## Testing

### Manual Testing

1. **Register a new user**:

    - Navigate to http://localhost:5000/register
    - Create an account with valid credentials

2. **Create an API key**:

    - Login and go to dashboard
    - Click "Create New API Key"
    - Copy the generated key

3. **Test API endpoints**:

    ```bash
    # Health check (no auth required)
    curl http://localhost:5000/api/health

    # Get all countries
    curl -H "X-API-Key: YOUR_API_KEY" \
         http://localhost:5000/api/countries

    # Search specific country
    curl -H "X-API-Key: YOUR_API_KEY" \
         http://localhost:5000/api/countries/germany
    ```

### API Response Examples

**Successful Response**:

```json
{
    "status": "success",
    "count": 1,
    "data": [...]
}
```

**Error Response**:

```json
{
	"error": "Invalid API key",
	"status": 401
}
```
