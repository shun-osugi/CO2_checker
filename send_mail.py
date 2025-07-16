import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Firebase初期化
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

#予測値を取得
predicted_co2 = 0.0
docs = db.collection("co2-prediction").stream()
first_doc = next(docs, None)

if first_doc:
    data = first_doc.to_dict()
    #四捨五入
    predicted_co2 = round(data["latest"])
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
            "from": {"email": "co2checkeralerts@gmail.com"},
            "subject": "[CO₂濃度予測]換気しましょう",
            "content": [{
                "type": "text/html",
                "value": f"<h2>⚠️CO₂濃度が基準値を超えました</h2>15分後のCO2濃度は<strong style='color: red;font-size: 20px'>{predicted_co2}</strong>ppmです。<br>換気をおすすめします。<?p><p style='font-size: 12px; color: gray;'>このメールは自動送信です。</p>"
            }]
        }
        sg.send(message)