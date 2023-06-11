//****************************************
//成功関数
//****************************************
let map;

function mapsInit(position) {
    console.log(position, '取得');
    //lat=緯度、lon=経度 を取得
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    //Map表示
    map = new Bmap("#myMap");
    map.startMap(lat, lon, "load", 18);
};

//****************************************
//失敗関数
//****************************************
function mapsError(error) {
    let e = "";
    if (error.code == 1) { //1＝位置情報取得が許可されてない（ブラウザの設定）
    e = "位置情報が許可されてません";
    }
    if (error.code == 2) { //2＝現在地を特定できない
    e = "現在位置を特定できません";
    }
    if (error.code == 3) { //3＝位置情報を取得する前にタイムアウトになった場合
    e = "位置情報を取得する前にタイムアウトになりました";
    }
    alert("エラー：" + e);
};

//****************************************
//オプション設定
//****************************************
const set = {
    enableHighAccuracy: true, //より高精度な位置を求める
    maximumAge: 20000, //最後の現在地情報取得が20秒以内であればその情報を再利用する設定
    timeout: 10000 //10秒以内に現在地情報を取得できなければ、処理を終了
};


//最初に実行する関数
function GetMap() {
    navigator.geolocation.getCurrentPosition(mapsInit, mapsError, set);
}

//****************************************
// 住所データから候補エリアを取得
//****************************************

function GetRandomAddress(){
    let index = Math.floor(Math.random() * tokyoAddress.length);
    console.log(tokyoAddress[index], "東京の住所");
    return tokyoAddress[index];
}

//****************************************
// ChatGPT
//****************************************

const CHAT_GPT_URL = "https://api.openai.com/v1/chat/completions";

// 文字列中に含まれる"{"と"}"の間に含まれる文字列を抽出する関数
function extractStringBetweenCurlyBraces(str) {
    // 改行コードを削除
    str = str.replace(/\r?\n/g, "");
    // 正規表現を定義
    const re = /{(.*?)}/;
    // 正規表現にマッチした部分を取得
    const match = str.match(re);
    // マッチした部分があれば、最初のグループ（括弧で囲まれた部分）を返す
    if (match) {
      return match[1];
    }
    // マッチしなければ、元の文字列を返す
    else {
      return str;
    }
}

function GetSpotByChatGPT(address) {
    let text = "以下の住所の近くにある観光スポットをspot, address,  longitude, latitudeの4項目を持つ厳密なJSON形式で日本語で1つ教えてください！\n\n住所：" + address;
    console.log(text);
    async function getResponse() {
        try {
            const response = await axios.post(
                CHAT_GPT_URL,
                {
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        { "role": "user", "content": text }
                    ]
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${CHAT_GPT_API_KEY}`,
                    },
                }
            );
            let chatgpt_response = response.data.choices[0].message.content;
            console.log(chatgpt_response);

            // スポット情報を取得
            let spotInfo = extractStringBetweenCurlyBraces(chatgpt_response);
            // alert(spotInfo);
            spotInfo = "{" + spotInfo + "}";
            console.log(spotInfo);
           
            let spot = JSON.parse(spotInfo);

            console.log(spot.spot);
            console.log(spot.address);
            console.log(spot.latitude);
            console.log(spot.longitude);

            // Map表示
            map.startMap(spot.latitude, spot.longitude, "load", 18);
            //Pinを追加
            let pin = map.pin(spot.latitude, spot.longitude, "pink");
            //Infoboxを追加
            map.infobox(spot.latitude, spot.longitude, spot.spot, spot.address);            
        } catch (error) {
            console.log(error);
        }
    }
    getResponse();
}