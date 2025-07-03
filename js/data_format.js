/**
 * CSVデータを解析し、特定のデバイス("Ｒ３ー４０１")のデータを行ごとの配列に変換します。
 * @param {string} data - CSV形式の文字列データ。
 * @returns {Array<Array<number>>} - [CO2, 気温, 湿度, UNIXタイムスタンプ] の配列の配列。
 */
function convertArray(data) {
    const dataArray = [];
    const dataString = data.split("\r\n"); // 行ごとに分割

    for (const line of dataString) {
        const columns = line.split(",");
        // "Ｒ３ー４０１"のデータであり、必要な列が存在するか確認
        if (columns.length > 6 && columns[1] === "Ｒ３ー４０１") {
            // CO2, 気温, 湿度, タイムスタンプのデータを数値に変換して抽出
            dataArray.push(columns.slice(3, 7).map(parseFloat));
        }
    }
    return dataArray;
}

/**
 * UNIXタイムスタンプ（秒）を 'YYYY-MM-DDTHH:mm:ss' 形式の文字列に変換します。
 * @param {number} unixSeconds - UNIXタイムスタンプ（秒）。
 * @returns {string} - フォーマットされた日時文字列。
 */
function formatTimestamp(unixSeconds) {
    const date = new Date(unixSeconds * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * データを取得し、指定されたJSON形式に整形してAPIに送信する非同期関数。
 */
async function sendFormattedData() {
    try {
        // データの取得
        const now = Math.floor(new Date().getTime() / 1000);
        const startTime = now - 3600 * 24; // 24時間前

        const response = await fetch(
            `https://airoco.necolico.jp/data-api/day-csv?id=CgETViZ2&subscription-key=6b8aa7133ece423c836c38af01c59880&startDate=${startTime}`
        );

        if (!response.ok) {
            throw new Error(`データ取得エラー: ${response.statusText}`);
        }
        const rawData = await response.text();

        // データの処理と整形
        const allData = convertArray(rawData);
        if (allData.length === 0) {
            console.warn("対象のデータが見つかりませんでした。");
            return;
        }

        // 最新のデータから最大72件を取得
        const recentData = allData.slice(-72);

        // 指定されたフォーマットに変換
        const formattedData = recentData.map((row) => ({
            timestamp: formatTimestamp(row[3]), // [3]はタイムスタンプ
            co2: row[0], // [0]はCO2
            temperature: row[1], // [1]は気温
            humidity: row[2], // [2]は湿度
        }));

        // APIに送信するための最終的なペイロードを作成
        const payload = {
            data: formattedData,
        };

        // コンソールでの確認
        // 送信するJSONデータを確認したい場合は、以下の行のコメントを解除してください。
        console.log("送信するデータ:", JSON.stringify(payload, null, 2));

        // APIへのPOSTリクエスト送信
        /*
        // TODO: 'YOUR_API_ENDPOINT'を実際のAPIエンドポイントに置き換えてください。
        const apiEndpoint = 'YOUR_API_ENDPOINT'; 

        const postResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (postResponse.ok) {
            console.log("データの送信に成功しました。");
            const result = await postResponse.json();
            console.log("サーバーからの応答:", result);
        } else {
            console.error("データの送信に失敗しました:", postResponse.status, postResponse.statusText);
        }
        */
    } catch (error) {
        console.error("処理中にエラーが発生しました:", error);
    }
}

// 関数を実行
sendFormattedData();
