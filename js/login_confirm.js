import { app } from "./firebase_init.js";
import {
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
    getFirestore,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const auth = getAuth(app);

$(async function waitForEmailVerification() {
    const auth = getAuth();
    const user = auth.currentUser;

    onAuthStateChanged(auth, async function (user) {
        const delay = (ms) => new Promise((res) => setTimeout(res, ms));

        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            await user.reload(); //最新状態にする

            if (user.emailVerified) {
                console.log("メール確認済み！");
                window.location.href = "index.html";
                return;
            }

            console.log(`確認チェック ${attempts + 1} 回目...まだ未確認`);
            await delay(5000);
            attempts++;
        }

        //タイムアウト
        alert("一定時間内にメールが確認されませんでした。");
        window.location.href = "login.html";
    })
})

$('#resend').click(function(){
    const user = auth.currentUser;
    sendEmailVerification(user).then(() => {
        alert("メールを再送しました。"); /* 成功メッセージ*/
    });
})