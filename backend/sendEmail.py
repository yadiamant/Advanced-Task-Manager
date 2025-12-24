





import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_email(to_email, subject, content):
    message = Mail(
        from_email="yairdi1997@gmail.com",  # המייל שאומת ב-SendGrid
        to_emails=to_email,
        subject=subject,
        plain_text_content=content
    )

    try:
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        response = sg.send(message)
        print(f"Status code: {response.status_code}")
    except Exception as e:
        print(e)



from dotenv import load_dotenv
import os

load_dotenv()
print(os.getenv("SENDGRID_API_KEY"))  # לבדיקה






