"use strict";
// screenの属性を受け取る
const screenCanvas = document.getElementById('screen');
// 2dコンテキスト
const ctx = screenCanvas.getContext('2d');
// canvasのサイズ。clearRectで使う
const canvasWidth = screenCanvas.getAttribute('width');
const canvasHeight = screenCanvas.getAttribute('height');
// test
const test = document.getElementById('test');
const test2 = document.getElementById('test2');
// start
const start = document.getElementById("start");
// 曲のBPM
const BPM = 200;
// 曲の譜面
const chart = ['10201120', '1011201020101120', '20102212', '1020112110102000', '1112121211121222', '1112121212212212', '1112111212211212', '1112111212121000'];
// 96分音符ごとに動かす(ミリ秒）
// 60BPMのときの1拍が1000ms、4拍が1小節、1小節を48等分すると48分音符
let updateTime = 60 / BPM * 1000 * 4 / 96; // 200BPMのとき12.5ms
// ノーツを表示するy座標
const noteHeight = 6;
// 48分音符同士のx座標の間隔（ピクセル）
// 48分音符が太鼓の譜面において最小の間隔
const interval48Length = 12;
// これから配置するノーツのx座標（ピクセル）
let settingNotePosition = 1000;
// 描写範囲内にある最初のノーツ
let firstNoteSubscript = 0;
// 描写範囲内にある最後のノーツ
let lastNoteSubscript = 0;
//--- 画像 ---//
const imageElement = [
    new Image(), new Image(), new Image()
];
imageElement[1].src = "赤玉.png";
imageElement[2].src = "青玉.png";
//--- 音声 ---//
// 効果音を複数用意して、同時に再生できるようにしておく
const audioElement1 = new Array(20).fill(new Audio());
const audioElement2 = new Array(20).fill(new Audio());
// audioElement[1] = <HTMLAudioElement>document.getElementById('don');
// audioElement[2] = <HTMLAudioElement>document.getElementById('katu');
// audioElement[1].src = "赤玉.mp3";
// audioElement[2].src = "青玉.mp3";
let audioElement1Subscript = 0;
let audioElement2Subscript = 0;
//////////////////////
// ---noteClass--- //
//////////////////////
class noteClass {
    constructor(noteType, position) {
        this.moveThisPosition = () => {
            //  96分音符の間隔で移動する
            this._position -= interval48Length / 2;
        };
        this._noteType = noteType;
        this._position = position;
    }
    get noteType() {
        return this._noteType;
    }
    get position() {
        return this._position;
    }
}
// インスタンス生成
let note = new Array();
// 譜面を読んで全てのノーツを配置
for (let i = 0; i < chart.length; i++) {
    for (let j = 0; j < chart[i].length; j++) {
        if (chart[i][j] !== '0') {
            note.push(new noteClass(chart[i][j], settingNotePosition));
        }
        settingNotePosition += Math.floor(48 / chart[i].length * interval48Length);
    }
}
// 音声オン
start.addEventListener('click', e => {
    //--- ブラウザの音声エラーを回避する魔法のコード！！！ ---//
    for (let i = 0; i < audioElement1.length; i++) {
        audioElement1[i].muted = false;
        audioElement2[i].muted = false;
    }
    for (let i = 0; i < audioElement1.length; i++) {
        audioElement1[i].src = "赤玉.mp3";
    }
    for (let i = 0; i < audioElement2.length; i++) {
        audioElement2[i].src = "青玉.mp3";
    }
});
// クリックするとノーツが動き出す
screenCanvas.addEventListener('click', e => {
    setInterval(movePosition, updateTime);
});
// ノーツ移動のループ（setInterval）
let movePosition = () => {
    // 全てのノーツが左に移動する
    for (let i = firstNoteSubscript; i < note.length; i++) {
        note[i].moveThisPosition();
    }
    // 描写範囲内に入ったノーツがあるか調べる
    for (let i = lastNoteSubscript; i < note.length; i++) {
        if (note[i].position <= 1800) {
            lastNoteSubscript = i;
        }
        else
            break;
    }
    // 描写範囲内の全てのノーツを描写する
    drawAllImage();
    // 判定円上（or 左）にあるノーツを叩く
    attackNote();
};
// 全ての画像を描写する関数
let drawAllImage = () => {
    // Canvasをクリアする
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // 判定円を描写する
    ctx.strokeStyle = "rgba(255,255,255, 0.9)";
    ctx.arc(50, noteHeight + 25, 25, 0, Math.PI * 2, true);
    ctx.stroke();
    // 配列の末尾から画像を描写する
    for (let i = lastNoteSubscript; i >= firstNoteSubscript; i--) {
        ctx.drawImage(imageElement[note[i].noteType], note[i].position, noteHeight, 50, 50);
    }
};
// ノーツを叩く
let attackNote = () => {
    if (note[firstNoteSubscript].position <= 50) {
        // switch文が通らない、数値は無理なのか？？
        // 違う、わけわからんけどnoteTypeが全角数字になっている、わけわからんけど
        if (note[firstNoteSubscript].noteType == 1) {
            audioElement1[audioElement1Subscript].currentTime = 0;
            audioElement1[audioElement1Subscript].play();
            test.insertAdjacentText("beforeend", audioElement1Subscript + " ");
            audioElement1Subscript++;
            if (audioElement1Subscript === audioElement1.length)
                audioElement1Subscript = 0;
        }
        if (note[firstNoteSubscript].noteType == 2) {
            audioElement2[audioElement2Subscript].currentTime = 0.2;
            audioElement2[audioElement2Subscript].play();
            test.insertAdjacentText("beforeend", audioElement2Subscript + " ");
            audioElement2Subscript++;
            if (audioElement2Subscript === audioElement2.length)
                audioElement2Subscript = 0;
        }
        // switch(note[firstNoteSubscript].noteType){
        //     case 1:
        //         audioElement1[audioElement1Subscript].play();
        //         audioElement1Subscript++;
        //         if(audioElement1Subscript > 2) audioElement1Subscript = 0;
        //         break;
        //     case 2:
        //         audioElement2[audioElement2Subscript].play();
        //         audioElement2Subscript++;
        //         if(audioElement2Subscript > 2) audioElement2Subscript = 0;
        //         break;
        //     default:
        //         test.innerText = "unko";
        //         break;
        // }
        firstNoteSubscript++;
    }
};
export {};
