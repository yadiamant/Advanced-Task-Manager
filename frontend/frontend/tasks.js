

// אלמנטים מה-DOM
const taskList = document.getElementById("task-list");
const addBtn = document.getElementById("add-task-btn");
const logoutBtn = document.getElementById("logout-btn");
const userNameSpan = document.getElementById("user-name");

const searchInput = document.getElementById("search");
const filterStatus = document.getElementById("filter-status");
const filterDate = document.getElementById("filter-date");

// משתנים גלובליים
let token = localStorage.getItem("token");
let username = localStorage.getItem("username");
let allTasks = [];

// בדיקה אם המשתמש מחובר
if (!token) window.location.href = "login.html";

userNameSpan.textContent = username;

// Logout
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "login.html";
});

// טעינת כל המשימות מהשרת
async function loadTasks() {
    const res = await fetch("http://127.0.0.1:5000/tasks", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    allTasks = await res.json();
    renderTasks();
}

// סינון לפי תאריך
function filterTasksByDate(tasks, filterValue) {
    const today = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay()); // ראשון בשבוע

    return tasks.filter(task => {
        if (!task.due_date) return true; // אם אין תאריך, תמיד מציגים
        const taskDate = new Date(task.due_date);
        switch (filterValue) {
            case "today": return taskDate.toDateString() === today.toDateString();
            case "week": return taskDate >= startOfWeek && taskDate <= today;
            case "overdue": return taskDate < today && !task.completed;
            default: return true;
        }
    });
}

// הצגת משימות
function renderTasks() {
    const searchValue = searchInput.value.toLowerCase();
    const statusValue = filterStatus.value;
    const dateValue = filterDate.value;

    taskList.innerHTML = "";

    let filteredTasks = filterTasksByDate(allTasks, dateValue)
        .filter(task => task.title.toLowerCase().includes(searchValue))
        .filter(task => {
            if (statusValue === "completed") return task.completed;
            if (statusValue === "active") return !task.completed;
            return true;
        });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        // אם המשימה הושלמה – עיצוב
        if (task.completed) {
            li.style.textDecoration = "line-through";
            li.style.opacity = "0.6";
        }

        // Checkbox להשלמה
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => toggleTask(task.id);

        // תאריך יעד
        const dueDate = task.due_date 
            ? new Date(task.due_date).toLocaleDateString("he-IL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }) 
            : "ללא תאריך";

        // תאריך יצירה
        const createdAt = task.created_at
            ? new Date(task.created_at).toLocaleDateString("he-IL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
            : "לא ידוע";


        // יצירת תוכן המשימה
        li.innerHTML = `
            <strong>${task.title}</strong><br>
        `;    

        const descriptionEl = document.createElement("div");
        descriptionEl.textContent = task.description || "ללא תיאור";

        // יצירת אלמנט לתאריכים
        const datesEl = document.createElement("div");
        datesEl.textContent = `📅 יעד: ${dueDate} | נוצר: ${createdAt}`;

        // סימון overdue
        const today = new Date().toISOString().split("T")[0];
        if (!task.completed && task.due_date < today) li.classList.add("overdue");

        // כפתור עריכה
        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.onclick = () => editTask(task.id, task.title, task.description, task.due_date);

        // כפתור מחיקה
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️";
        deleteBtn.onclick = () => deleteTask(task.id);

        // הוספה ל-li
        li.appendChild(checkbox);
        li.appendChild(descriptionEl);
        li.appendChild(datesEl);
        // li.appendChild(dueSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

// הוספת משימה
addBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("due_date").value;
    if (!title) return;

    const token = localStorage.getItem("token");

    if (!token) {
        alert("אתה לא מחובר! אנא התחבר מחדש.");
        return;
    }
    const response = await fetch("http://127.0.0.1:5000/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, due_date: dueDate })
    });
    if (!response.ok) return console.error("Failed to add task", response.status);

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("due_date").value = "";

    loadTasks();
});

// מחיקת משימה
async function deleteTask(id) {
    await fetch(`http://127.0.0.1:5000/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    loadTasks();
}

// עריכת משימה כולל תאריך
async function editTask(id, oldTitle, oldDescription, oldDueDate) {
    const newTitle = prompt("ערוך כותרת:", oldTitle);
    if (newTitle === null) return;
    const newDescription = prompt("ערוך תיאור:", oldDescription);
    if (newDescription === null) return;
    const newDueDate = prompt("ערוך תאריך ושעה (YYYY-MM-DDTHH:MM):", oldDueDate);
    if (newDueDate === null) return;

    await fetch(`http://127.0.0.1:5000/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, description: newDescription, due_date: newDueDate })
    });

    loadTasks();
}

// Toggle מצב הושלמה / לא הושלמה
async function toggleTask(id) {
    await fetch(`http://127.0.0.1:5000/tasks/${id}/toggle`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
    });
    loadTasks();
}

// מאזיני אירועים לסינון חיפוש / סטטוס / תאריך
searchInput.addEventListener("input", renderTasks);
filterStatus.addEventListener("change", renderTasks);
filterDate.addEventListener("change", renderTasks);

// טעינת המשימות בהתחלה
loadTasks();
