

const registerBtn = document.getElementById("register-btn");

registerBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const email = document.getElementById("email").value.trim(); // הוספתי

    if(!username || !email || !password) return alert("יש למלא שם משתמש, אימייל וסיסמה");

    const res = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username, email, password}) // הוספתי את email
    });

    const data = await res.json();

    if(res.status === 201){
        alert("נרשמת בהצלחה! עכשיו התחבר");
        window.location.href = "login.html";
    } else {
        alert(data.error);
    }
});
