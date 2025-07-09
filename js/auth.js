// DOMが完全に読み込まれてからスクリプトを実行
document.addEventListener("DOMContentLoaded", () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCrY_bI-S8BFkH-mG5HRDtrlXZ_96cf1nM",
        authDomain: "jp-co2-checker.firebaseapp.com",
        projectId: "jp-co2-checker",
        storageBucket: "jp-co2-checker.firebasestorage.app",
        messagingSenderId: "380281511593",
        appId: "1:380281511593:web:5bf556efa30213a85293b8",
        measurementId: "G-WHNH6TP77Y",
    };

    // Firebaseの初期化
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // DOM要素の取得
    const logoutBtn = document.getElementById("logout-btn");
    const borderInput = document.getElementById("co2-border-input");
    const saveBorderBtn = document.getElementById("save-border-btn");
    const saveStatus = document.getElementById("save-status");
    const co2PredictionElement = document.getElementById("co2-prediction");

    // ===============================================================
    // 認証状態の監視 (認証ガード)
    // ===============================================================
    auth.onAuthStateChanged((user) => {
        if (user) {
            // ログイン状態の場合：ユーザー情報を利用して閾値を読み込む
            console.log("ログイン済みユーザー:", user.uid);
            loadBorder(user.uid);
            loadCo2Prediction();
        } else {
            // 未ログイン状態の場合：ログインページにリダイレクト
            console.log("未ログインのためリダイレクトします");
            // ★ご自身のログインページのパスに変更してください
            window.location.href = "login.html";
        }
    });

    // ログアウト処理
    logoutBtn.addEventListener("click", () => {
        auth.signOut().then(() => {
            console.log("ログアウトしました");
            // ログアウト後、onAuthStateChangedが再度呼ばれ、リダイレクトが実行される
        });
    });

    // 閾値の保存処理
    saveBorderBtn.addEventListener("click", () => {
        const user = auth.currentUser;
        if (!user) return;

        const inputValue = borderInput.value;
        // 小数点を含まないか、また0以上の整数であるかをチェック
        const numberValue = Number(inputValue);

        if (!Number.isInteger(numberValue) || numberValue < 0) {
            saveStatus.textContent = "0以上の整数で入力してください。";
            saveStatus.className = "form-text mt-2 text-danger";
            return;
        }

        // 正しい値のみをFirestoreに保存
        db.collection("users")
            .doc(user.uid)
            .set({ border: numberValue }, { merge: true })
            .then(() => {
                saveStatus.textContent = "保存しました！";
                saveStatus.className = "form-text mt-2 text-success";
                setTimeout(() => (saveStatus.textContent = ""), 3000);
            })
            .catch((error) => {
                console.error("保存エラー", error);
                saveStatus.textContent = "保存に失敗しました。";
                saveStatus.className = "form-text mt-2 text-danger";
            });
    });

    // 閾値の読み込み処理
    function loadBorder(uid) {
        db.collection("users")
            .doc(uid)
            .get()
            .then((doc) => {
                if (doc.exists && doc.data().border != null) {
                    borderInput.value = doc.data().border;
                }
            })
            .catch((error) => console.error("読み込みエラー", error));
    }

    // CO2予測値の読み込み処理
    function loadCo2Prediction() {
        db.collection("co2-prediction")
            .doc("TWNDdsILjaOACEoFemFx")
            .get()
            .then((doc) => {
                if (doc.exists && doc.data().latest != null) {
                    const value = doc.data().latest;
                    if (co2PredictionElement) {
                        co2PredictionElement.textContent = `${value.toFixed(
                            2
                        )} ppm`;
                    }
                } else {
                    console.warn("予測値が存在しません。");
                }
            })
            .catch((error) => {
                console.error("CO2予測値の読み込みエラー:", error);
            });
    }
});
