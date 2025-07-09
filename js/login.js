import { app } from "./firebase_init.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const allow_domain = "@ccmailg.meijo-u.ac.jp";

$("button[type=submit]").click(function () {
    const email = $("input[type=email]").val();
    const password = $("input[type=password]").val();

    //大学ドメイン以外を弾く
    if (!email.endsWith(allow_domain)) {
        alert("名城大学のメールアドレスでログインしてください。");
        return;
    }

    //ログイン
    console.log("ログイン");
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("登録成功"); /*成功メッセージ*/

            //DBに保存
            setDoc(doc(db, "users", user.uid), {
                email: user.email,
                border: 0,
                created: serverTimestamp(),
            })
                .then(() => {
                    console.log("Firestoreにユーザー情報を保存しました");
                })
                .catch((err) => {
                    console.error("Firestore保存エラー:", err);
                });
            //メールを送信
            return sendEmailVerification(user).then(() => {
                console.log("ログイン成功"); /* 成功メッセージ*/
                window.location.href = "login_confirm.html";
            });
        })
        .catch((error) => {
            //すでにメールアドレスが存在した時
            if (error.code === "auth/email-already-in-use") {
                return signInWithEmailAndPassword(auth, email, password).then(
                    (userCredential) => {
                        const user = userCredential.user;

                        //メールアドレスを確認済みかどうか
                        if (user.emailVerified) {
                            console.log("ログイン成功"); /* 成功メッセージ*/
                            window.location.href = "index.html";
                        } else {
                            alert("メールアドレスが未確認です。");
                        }
                    }
                );
                //エラー
            } else {
                console.log(`エラー：${error.message}`);
            }
        });
});
