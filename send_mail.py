import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()  # .env を読み込む

# Firebase初期化
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

#予測値を取得
predicted_co2 = 0.0
docs = db.collection("co2-prediction").stream()
if docs:
    first_doc = docs[0].to_dict()
    predicted_co2 = first_doc["latest"]
else:
    predicted_co2 = '＊エラー:CO2濃度を取得できませんでした。＊'


# Firestoreから全ユーザーのメール取得
emails = []

docs = db.collection("users").stream()
for doc in docs:
    data = doc.to_dict()
    emails.append({
        "email": data["email"],
        "border": data["border"]
        })

# SendGridで一斉送信
sg = SendGridAPIClient(os.environ["SENDGRID_API_KEY"])
for data in emails:
    if(predicted_co2 > data["border"]):
        message = {
            "personalizations": [{
                "to": [{"email": data["email"]}]
            }],
            "from": {"email": "upurocon@gmail.com"},
            "subject": "[テスト]CO2濃度予想",
            "content": [{
                "type": "text/plain",
                "value": f"15分後のCO2濃度は{predicted_co2}ppmです。"
            }]
        }
        sg.send(message)