# Student Management System - Backend

This is the backend for the Student Management System. It provides APIs for managing student profiles, assignments, documents, and academic reports.

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- MongoDB installed and running on localhost:27017 (or update the MONGO_URI in .env file)

### Installation
1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - The .env file contains the configuration for the application
   - By default, the application uses JSON files for data storage
   - To use MongoDB, set `USE_DB=true` in the .env file

### Importing Data to MongoDB
To import the sample data from JSON files to MongoDB:

1. Make sure MongoDB is running
2. Run the import script:
   ```
   npm run import-data
   ```
3. This will:
   - Connect to MongoDB
   - Clear any existing data in the collections
   - Import all data from JSON files
   - Update the .env file to use MongoDB

### Running the Server
1. Start the server:
   ```
   npm start
   ```
2. For development with auto-restart:
   ```
   npm run dev
   ```

## API Documentation

The server provides the following API endpoints:

### Authentication
- `POST /api/auth/login` - Authenticate user

### Profile
- `GET /api/profile` - Get student profile
- `POST /api/profile/update` - Update student profile
- `GET /api/profile/academic/progress` - Get academic progress
- `GET /api/profile/attendance` - Get attendance data

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get a specific assignment
- `POST /api/assignments/:id/submit` - Submit an assignment

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/recent` - Get recent documents
- `GET /api/documents/important` - Get important documents
- `POST /api/documents/upload` - Upload a document
- `DELETE /api/documents/:id` - Delete a document

### Reports
- `GET /api/reports/semesters` - Get all semesters
- `GET /api/reports/semesters/:id` - Get report for a semester
- `GET /api/reports` - Get all reports
- `GET /api/reports/performance/overall` - Get overall performance 