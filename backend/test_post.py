

import requests

data = {"title": "בדיקה", "description": "לראות אם POST עובד"}
response = requests.post("http://127.0.0.1:5000/tasks", json=data)
print(response.json())
