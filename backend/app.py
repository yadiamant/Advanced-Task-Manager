

from flask import Flask, jsonify, request
from flask_cors import CORS

import sqlite3
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)

bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = "super-secret-key"
jwt = JWTManager(app)

CORS(app)

tasks = []
task_id_counter = 1

@app.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, description, due_date, completed, created_at
        FROM tasks
        WHERE user_id = ?
        """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    tasks = []
    for r in rows:
        tasks.append({
        "id": r[0],
        "title": r[1],
        "description": r[2],
        "due_date": r[3],
        "completed": bool(r[4]),
        "created_at": r[5]
    })

    return jsonify(tasks)




@app.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    print(">>> CREATE TASK CALLED <<<")
    user_id = int(get_jwt_identity())
    data = request.get_json()
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO tasks (title, description, completed, due_date, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (data["title"], data.get("description", ""), 0, data.get("due_date"), user_id, created_at) )
        conn.commit()
    except Exception as e:
        conn.close()
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 400    
    # except sqlite3.IntegrityError as e:
        #print("SQLite Error:", e)
        
    rows = cursor.fetchall()
    print("Rows found:", rows)

    conn.commit()
    conn.close()

    return jsonify({"message": "Task created"}), 201 

@app.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    title = data.get("title", "")
    description = data.get("description", "")
    due_date = data.get("due_date", "")
    

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(
    "UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ? AND user_id = ?",
    (title, description, due_date, task_id, user_id)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Task updated"})






@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Task deleted"})

@app.route("/tasks/<int:task_id>/toggle", methods=["PUT"])
@jwt_required()
def toggle_task(task_id):
    user_id = int(get_jwt_identity())

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE tasks
        SET completed = CASE completed
            WHEN 0 THEN 1
            ELSE 0
        END
        WHERE id = ? AND user_id = ?
    """, (task_id, user_id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Task toggled"})




@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    email = data["email"] 

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
            (username, hashed_password, email)
        )
        conn.commit()
    except:
        return jsonify({"error": "Username already exists"}), 400

    conn.close()
    return jsonify({"message": "User registered successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT id, password FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.check_password_hash(user[1], password):
        token = create_access_token(identity=str(user[0]))
        return jsonify({"token": token}), 200

    return jsonify({"error": "Invalid username or password"}), 401


from datetime import datetime, timedelta
import sqlite3
from sendEmail import send_email  # נניח ששמרת את הקוד שלך ב־send_email.py

REMINDER_HOURS = 2  # כמה שעות לפני הדדליין לשלוח מייל

def check_due_tasks():

    now = datetime.now()
    now_clean = now.replace(second=0, microsecond=0)
    #print(now)

    reminder_time = now + timedelta(hours=REMINDER_HOURS)
    reminder_time_clean = reminder_time.replace(second=0, microsecond=0)
    #print(reminder_time)

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT tasks.id, tasks.title, tasks.due_date, users.email
        FROM tasks
        JOIN users ON tasks.user_id = users.id
        WHERE tasks.reminder_sent = 0 AND tasks.completed = 0
    """)
    rows = cursor.fetchall()

    for task_id, title, due_date, email in rows:

        #print(due_date)

        if due_date:
            due = datetime.fromisoformat(due_date).replace(second=0, microsecond=0)
        else:
            due = None

        #print(due)

        if now_clean < due <= reminder_time_clean:
            send_email(
                email,
                f"⏰ תזכורת למשימה: {title}",
                f"המשימה '{title}' מסתיימת בעוד {REMINDER_HOURS} שעות"
            )
            # מסמן שהמייל נשלח
            cursor.execute("UPDATE tasks SET reminder_sent = 1 WHERE id = ?", (task_id,))

    conn.commit()
    conn.close()


from apscheduler.schedulers.background import BackgroundScheduler


scheduler = BackgroundScheduler()
scheduler.add_job(check_due_tasks, "interval", minutes=10)
scheduler.start()

    


if __name__ == "__main__":
    app.run(debug=True)

