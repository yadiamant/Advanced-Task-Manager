

const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if(!username || !password) return alert("יש למלא שם משתמש וסיסמה");

    const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username, password})
    });

    const data = await res.json();

    if(res.status === 200){
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        window.location.href = "tasks.html";
    } else {
        alert(data.error);
    }

    localStorage.getItem("token")
});
