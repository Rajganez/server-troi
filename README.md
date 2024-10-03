# TrueROI Backend

This is the backend for the **TrueROI** application. The backend is built using **Node.js** and **Express.js** and handles authentication, database management, file uploads, email communication, and API requests. The backend communicates with a MongoDB database for storing and retrieving user data and provides APIs for the frontend to interact with.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [File Uploads](#file-uploads)
- [Security](#security)

## Technologies Used

The backend relies on the following npm packages and technologies:

- **Node.js**: A JavaScript runtime built on Chrome's V8 engine.
- **Express.js**: A fast web framework for Node.js.
- **MongoDB**: NoSQL database used to store user data.
- **Multer**: A middleware for handling multipart/form-data for file uploads.
- **JWT (jsonwebtoken)**: Used for user authentication via tokens.
- **Bcrypt**: Used to hash user passwords for secure storage.
- **Nodemailer**: Used to send emails for password reset and notifications.
- **Cors**: Middleware to enable Cross-Origin Resource Sharing.
- **Dotenv**: Loads environment variables from a `.env` file.
- **Cookie-Parser**: Middleware for parsing cookies attached to client requests.
- **Read-Excel-File**: A utility for reading Excel files to process data uploads.
- **Nodemon**: A tool for monitoring the application during development and automatically restarting the server on file changes.

## Features

- **User Authentication**: Secure login and registration using JWT.
- **Password Reset**: Password reset functionality via email.
- **File Uploads**: Ability to upload files such as documents, images, and videos.
- **Database Management**: Store user and organizational data in MongoDB.
- **Excel File Parsing**: Ability to read and process Excel files using `read-excel-file` for bulk data uploads.
- **CORS Support**: Handle Cross-Origin requests for the frontend.

## Installation

To set up and run the backend locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone github.com/Rajganez/server-troi

   ```

```bash
cd server-troi
npm install
npm run dev
```

## MongoDB Connection URI

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority

## JWT Secret for token generation

JWT_SECRET=<your_jwt_secret>

## Email configuration for Nodemailer

EMAIL_USER=<your_email_user>
EMAIL_PASS=<your_email_pass>

## API Endpoints

Authentication Routes
POST /auth/register

Registers a new user with email and password.
POST /auth/login

Logs in a user and returns a JWT token.
POST /auth/forgot-user

Sends a password reset email with a reset link.
POST /auth/password-reset

## File Uploads

POST /list/file-upload
Content-Type: multipart/form-data
Body: form-data (file: <file_to_upload>)

## Security

- Password Hashing: User passwords are hashed using bcrypt before being stored in the database to ensure security.

- JWT Authentication: JSON Web Tokens are used to protect routes and verify user sessions.

- CORS: Cross-Origin Resource Sharing is enabled for secure communication between the backend and the frontend.

- Environment Variables: Sensitive data like database URIs and JWT secrets are stored securely in environment variables.
