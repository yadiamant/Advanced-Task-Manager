# Advanced-Task-Manager



A full-stack task management web application built as a self-learning project alongside my studies.
The system allows users to manage tasks efficiently with deadlines, filters, and email reminders.

🚀 Features

User registration & authentication

Create, read, update, and delete (CRUD) tasks

Task description, due date, and completion status

Search and filter tasks (by status, date, and keywords)

Email reminders before task deadlines

Clean and responsive UI

🛠 Tech Stack

Backend

Python

Flask

RESTful API

SQL (SQLite)

Frontend

HTML

CSS

Vanilla JavaScript

Additional

SendGrid (email notifications)

📂 Project Structure
project/
│
├── database.db
├── backend/
│   ├── app.py
│   └── sendEmail.py
│   ├── create_db.py
│
├── frontend/
│   ├── tasks.html
│   ├── login.html
│   ├── register.html
│   ├── tasks.js
│   ├── login.js
│   ├── register.js
│   └── style.css
│
└── README.md

⚙️ Setup & Run
1. Clone the repository
git clone https://github.com/yadiamant/Advanced-Task-Manager.git
cd your-repo

2. Install backend dependencies
pip install flask flask-cors flask-jwt-extended sendgrid

3. Run the server
python app.py


The backend server will run on:
http://127.0.0.1:5000

4. Open the frontend
Open register.html in your browser.

📸 Screenshots


🎯 Motivation

This project was built independently as part of my personal growth as a software developer.
It helped me strengthen my understanding of full-stack development, APIs, databases, and self-learning.

👤 Author

Yair Diamant
Junior Full-Stack Developer
🔗 LinkedIn: (https://github.com/yadiamant/Advanced-Task-Manager)



This project was developed from scratch and expanded step by step as part of a self-learning process beyond academic requirements.
