# 🚀 CRM Management System

A professional **Customer Relationship Management (CRM) System** built with **Python, Django, HTML, CSS, and JavaScript**.

This application helps manage customers, leads, tasks, and business reports through a clean and responsive dashboard.

---

## 📌 Project Overview

The CRM Management System is a full-stack web application designed to simplify customer and business activity management.

It provides dedicated modules for:

* 👥 Customer Management
* 🎯 Lead Management
* 📋 Task Management
* 📊 Reports & Analytics
* 📈 Dashboard Statistics

The project demonstrates practical experience with Django, database management, CRUD operations, templates, responsive UI, and Git/GitHub workflow.

---

## ✨ Features

### 👥 Customer Management

* Add new customers
* View customer details
* Edit customer information
* Delete customers
* Customer listing

### 🎯 Lead Management

* Create leads
* View lead information
* Update lead details
* Delete leads
* Manage lead statuses

### 📋 Task Management

* Create tasks
* Edit tasks
* Delete tasks
* Track pending tasks
* Track completed tasks
* Update task status

### 📊 Reports

The Reports module provides an overview of CRM activity:

* Total Customers
* Total Leads
* Total Tasks
* Pending Tasks
* Completed Tasks
* Lead Status Breakdown
* Task Summary

### 📈 Dashboard

The dashboard provides a quick overview of important CRM statistics and recent activity.

### 📱 Responsive Design

The interface is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

---

## 🛠️ Technologies Used

### Backend

* Python
* Django

### Frontend

* HTML5
* CSS3
* JavaScript

### Database

* SQLite3

### Development Tools

* Git
* GitHub
* Visual Studio Code

---

## 📂 Project Structure

```text
CRM_Project/
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── crm/
│   ├── migrations/
│   ├── templates/
│   │   └── crm/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
│
├── manage.py
├── db.sqlite3
├── README.md
└── .gitignore
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/CodeRana-bug/Rana.git
```

### 2. Open the Project

```bash
cd Rana
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

### 4. Activate Virtual Environment

#### Windows

```bash
venv\Scripts\activate
```

### 5. Install Django

```bash
pip install django
```

### 6. Apply Migrations

```bash
python manage.py migrate
```

### 7. Start Development Server

```bash
python manage.py runserver
```

Open the application in your browser:

```text
http://127.0.0.1:8000/
```

---

## 🧪 Testing

The project has been tested for:

* Customer CRUD
* Lead CRUD
* Task CRUD
* Task status updates
* Reports calculations
* Dashboard statistics
* Form validation
* Responsive layout
* Error handling
* Django system checks

---

## 🔐 Security & Production Notes

Before deploying the application to production:

* Set `DEBUG = False`
* Move sensitive settings to environment variables
* Use a secure production database
* Configure `ALLOWED_HOSTS`
* Configure production static files
* Use HTTPS
* Protect secret keys

---

## 🚀 Future Improvements

Possible future improvements include:

* User authentication and role-based access
* Advanced search and filtering
* Pagination
* Email notifications
* Customer activity history
* Lead conversion tracking
* Advanced analytics
* REST API
* PostgreSQL integration
* Cloud deployment

---

## 🎯 Learning Purpose

This project was created as a practical **Full Stack Development project** to demonstrate real-world development concepts including:

* Django MVC/MVT architecture
* Database models
* CRUD operations
* Django templates
* Form handling
* Responsive UI
* Backend logic
* Git/GitHub workflow

---

## 👨‍💻 Developer

**Rahul Rana**

Full Stack Developer

### Skills

* HTML
* CSS
* JavaScript
* Python
* Django
* SQL
* Git
* GitHub

---

## ⭐ Project Status

**Status:** Completed ✅

This project is continuously open for improvements and new features.

If you find this project useful, consider giving the repository a ⭐ on GitHub.
