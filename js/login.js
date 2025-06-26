import { app } from './firebase_init.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const auth = getAuth(app);

const allow_domain = '@ccmailg.meijo-u.ac.jp';

$('input[type=submit]').click(function(){
    const email = $('input[type=email]').val();
    const password = $('input[type=password]').val();

    //大学ドメイン以外を弾く
    if(!email.endsWith(allow_domain)){
        alert('名城大学のメールアドレスでログインしてください。');
        return;
    }
    
    //ログイン
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('登録成功');/*成功メッセージ*/
            //メールを送信
            return sendEmailVerification(user)
                .then(() => {
                    alert('メールを送信しました。確認してください。');
                })
        })
        .catch((error) => {
            //すでにメールアドレスが存在した時
            if(error.code === 'auth/email-already-in-use'){
                return signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;

                        //メールアドレスを確認済みかどうか
                        if(user.emailVerified){
                            console.log('ログイン成功');/* 成功メッセージ*/
                        }else{
                            alert('メールアドレスが未確認です。');
                        }
                    });
            //エラー
            } else{
                console.log(`エラー：${error.message}`);
            }
        });
})
