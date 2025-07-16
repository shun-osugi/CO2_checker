var canvas1 = document.getElementById("stage1");
var canvas2 = document.getElementById("stage2");
var canvas3 = document.getElementById("stage3");
const outputElement = document.getElementById("output_csv");

async function getCsvGraph() {
    var date = new Date(); // Dateオブジェクトを作成
    var a = date.getTime(); // UNIXタイムスタンプを取得する (ミリ秒単位)
    var curr_time = Math.floor(a / 1000); // UNIXタイムスタンプを取得する (秒単位)
    var tt = curr_time - 3600 * 24; // 24時間前
    const res = await fetch(
        `https://airoco.necolico.jp/data-api/day-csv?id=CgETViZ2&subscription-key=6b8aa7133ece423c836c38af01c59880&startDate=${tt}`
    );
    const raw_data = await res.text();
    console.log(raw_data);
    const allData = convertArray(raw_data);

    const recentData = allData.slice(-72);

    co2data = [];
    tempdata = [];
    RHdata = [];
    for (var row of recentData) {
        const time = new Date(row[3] * 1000); // UNIX秒 → Date
        co2data.push({ x: time, y: row[0] });
        tempdata.push({ x: time, y: row[1] });
        RHdata.push({ x: time, y: row[2] });
    }

    var co2Chart = drawGraph(canvas1, co2data, "CO₂濃度 [ppm]");
    var tempChart = drawGraph(canvas2, tempdata, "気温 [℃]");
    var RHChart = drawGraph(canvas3, RHdata, "相対湿度 [%]");
}

function drawGraph(canv, data, ylabel) {
    var chart = new Chart(canv, {
        type: "scatter",
        data: {
            datasets: [
                {
                    showLine: true,
                    data: data,
                    borderColor: "#3fab9b",
                },
            ],
        },
        options: {
            elements: {
                point: {
                    radius: 0,
                },
            },
            plugins: {
                legend: {
                    // 凡例の非表示
                    display: false,
                },
            },
            scales: {
                x: {
                    type: "time",
                    time: {
                        displayFormats: {
                            hour: "HH:mm",
                            minute: "HH:mm",
                            day: "M/d",
                        },
                    },
                    position: "bottom",
                },
                y: {
                    title: {
                        display: true,
                        text: ylabel,
                        font: {
                            size: 14,
                        },
                    },
                },
            },
        },
    });
    return chart;
}

function convertArray(data) {
    const dataArray = [];
    const dataString = data.split("\r\n");
    for (let i = 0; i < dataString.length; i++) {
        var data = dataString[i].split(",");
        if (data[1] == "Ｒ３ー４０１") {
            dataArray.push(data.slice(3, 7).map(parseFloat));
        }
    }
    return dataArray;
}

// DOM要素の取得
const graphSelector = document.getElementById("graphSelector");
const canvases = {
    stage1: document.getElementById("stage1"),
    stage2: document.getElementById("stage2"),
    stage3: document.getElementById("stage3"),
};

/**
 * グラフの表示を切り替える関数
 */
const updateGraphVisibility = () => {
    // プルダウンで選択されている値（value）を取得
    const selectedValue = graphSelector.value; // 全てのcanvasを一旦非表示にする

    for (const key in canvases) {
        if (canvases[key]) {
            canvases[key].style.display = "none";
        }
    } // 選択されたcanvasのみを表示する

    if (canvases[selectedValue]) {
        canvases[selectedValue].style.display = "block";
    }
};

// プルダウンメニューが変更されたときに関数を実行
graphSelector.addEventListener("change", updateGraphVisibility);

// ページの読み込み完了時に、初期表示を行う
document.addEventListener("DOMContentLoaded", () => {
    // 初期表示を更新
    updateGraphVisibility();
});

getCsvGraph();
