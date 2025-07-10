import { app } from "./firebase_init.js";
import {
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";


//確認メールの処理
const auth = getAuth(app);
$(async function waitForEmailVerification() {
    const auth = getAuth();
    const user = auth.currentUser;

    //ユーザーの状態が変化したら発火
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

//初期表示
$(toggle_active_mail_resend_btn());

//再送メールを送る処理
$('#resend').click(function(){
    const user = auth.currentUser;
    sendEmailVerification(user).then(() => {
        alert("メールを再送しました。"); /* 成功メッセージ*/
        toggle_active_mail_resend_btn();
    });
    
})

//メール再送ボタンを5秒間非アクティブにする関数
async function toggle_active_mail_resend_btn(){
    const resend_btn = $('button[id="resend"]');
    resend_btn.prop('disabled', true); 
    //元のテキストと背景色を保持
    const btn_text = resend_btn.text();
    const btn_color = resend_btn.css('background-color');

    let attempts = 0;
    const maxAttempts = 60;
    //5秒カウント
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    while (attempts < maxAttempts) {
        resend_btn.text(`${60-attempts}後に再送可能`);
        resend_btn.css('background-color', 'grey');
        await delay(1000);
        attempts++;
    }
    //元に戻す
    resend_btn.text(btn_text);
    resend_btn.css('background-color', btn_color);
    resend_btn.prop('disabled', false); 
}