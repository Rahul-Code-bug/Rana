# Task Management System

A full-stack task manager built with React, Node.js, Express, MySQL and Tailwind CSS.

## Features
- Register and log in with hashed passwords and JWT authentication
- Create, view, edit and delete personal tasks
- Task status (Pending / In Progress / Completed), priority, due date
- Search and filter tasks
- Responsive dashboard with summary cards

## Requirements
- Node.js 18+
- MySQL 8+

## 1. Create the database
Run the SQL in `server/database/schema.sql` in MySQL Workbench or your MySQL client.

## 2. Configure the backend
Copy `server/.env.example` to `server/.env` and update the MySQL credentials and JWT secret.

## 3. Install dependencies
From the project root:
```bash
npm install
npm run install:all
```

## 4. Start the app
```bash
npm run dev
```
Frontend: http://localhost:5173  
Backend: http://localhost:5000

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT required)
- `GET /api/tasks` (JWT required; supports `search`, `status`, `priority`)
- `POST /api/tasks` (JWT required)
- `PUT /api/tasks/:id` (JWT required)
- `DELETE /api/tasks/:id` (JWT required)

## Notes
This is a portfolio starter project. Use HTTPS, rate limiting, secure cookie/token handling, backups, and production secrets before deploying publicly.
