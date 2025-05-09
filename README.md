# Crypto Price Tracker

A NestJS application that tracks cryptocurrency prices (ETH and MATIC) and sends email alerts on significant price movements.

## Features

- Automated price tracking every 5 minutes
- Price increase email alerts (>3% in 1 hour)
- Target price alerts
- Historical price data storage
- API endpoints with Swagger documentation

## Tech Stack

- NestJS framework
- PostgreSQL database
- CoinGecko API for crypto prices
- Nodemailer for email notifications
- TypeORM for database management
- Swagger for API documentation
- Docker and Docker Compose

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/crypto-price-tracker.git
   cd crypto-price-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your environment variables:
   - Create a `.env` file based on `.env.example`
   - Set your database and email credentials

4. Start the application:
   ```
   npm run start:dev
   ```

### Using Docker

1. Build and start the containers:
   ```
   docker-compose up -d
   ```

2. The application will be available at http://localhost:3000

## API Endpoints

### Price Endpoints

#### Get Current Prices
```
GET /prices
```

Response:
```json
{
  "ethereum": 2345.67,
  "matic": 0.765
}
```

#### Get Price History for a Token
```
GET /prices/:token?limit=24
```

Parameters:
- `token`: `ethereum` or `matic`
- `limit` (optional): Number of data points to return (default: 24)

Response:
```json
[
  {
    "id": 123,
    "token": "ethereum",
    "price": 2345.67,
    "timestamp": "2023-05-15T12:05:00.000Z"
  },
  {
    "id": 120,
    "token": "ethereum",
    "price": 2342.50,
    "timestamp": "2023-05-15T12:00:00.000Z"
  }
]
```

### Alert Endpoints

#### Create Price Alert
```
POST /alerts
```

Request body:
```json
{
  "token": "ethereum",
  "targetPrice": 2500,
  "email": "user@example.com"
}
```

Response:
```json
{
  "id": 1,
  "token": "ethereum",
  "targetPrice": 2500,
  "email": "user@example.com",
  "triggered": false,
  "createdAt": "2023-05-15T12:00:00.000Z"
}
```

#### Get Active Price Alerts
```
GET /alerts
```

Response:
```json
[
  {
    "id": 1,
    "token": "ethereum",
    "targetPrice": 2500,
    "email": "user@example.com",
    "triggered": false,
    "createdAt": "2023-05-15T12:00:00.000Z"
  }
]
```

## Swagger Documentation

Access the Swagger documentation at http://localhost:3000/api

## Testing Email Functionality

Send a test email:
```
POST /test-email
```

Request body:
```json
{
  "email": "your-email@example.com"
}
```

Response:
```json
{
  "message": "Test email sent"
}
```

## License

This project is licensed under the MIT License.


## Environment Configuration

This application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=crypto_tracker

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# API Configuration
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Application Configuration
PORT=3000
DEFAULT_RECIPIENT=prakash@rainfall.one
PRICE_INCREASE_THRESHOLD=3
```

### Setting up Gmail for sending emails

To use Gmail for sending emails:

1. Enable 2-Step Verification for your Google Account
2. Create an App Password:
   - Go to your Google Account
   - Navigate to Security > App passwords
   - Select "Mail" as the app and "Other" as the device
   - Generate and copy the 16-character password
3. Use this password as the `EMAIL_PASSWORD` in your .env file