"use strict";
// exports.__esModule = true;
// screenの属性を受け取る
var screenCanvas = document.getElementById('screen');
// 2dコンテキスト
var ctx = screenCanvas.getContext('2d');
// canvasのサイズ。clearRectで使う
var canvasWidth = screenCanvas.getAttribute('width');
var canvasHeight = screenCanvas.getAttribute('height');
// test
var test = document.getElementById('test');
var test2 = document.getElementById('test2');
// 曲のBPM
var BPM = 200;
// 曲の譜面
var chart = ['10201120', '1011201020101120', '20102212', '1020112110102000', '1112121211121222', '1112121212212212', '1112111212211212', '1112111212121000'];
// 96分音符ごとに動かす(ミリ秒）
// 60BPMのときの1拍が1000ms、4拍が1小節、1小節を48等分すると48分音符
var updateTime = 60 / BPM * 1000 * 4 / 96; // 200BPMのとき12.5ms
// ノーツを表示するy座標
var noteHeight = 6;
// 48分音符同士のx座標の間隔（ピクセル）
// 48分音符が太鼓の譜面において最小の間隔
var interval48Length = 12;
// これから配置するノーツのx座標（ピクセル）
var settingNotePosition = 1000;
//////////////////////
// ---noteClass--- //
//////////////////////
var noteClass = /** @class */ (function () {
    function noteClass(noteType, position) {
        var _this = this;
        this.moveThisPosition = function () {
            //  96分音符の間隔で移動する
            _this._position -= interval48Length / 2;
        };
        this.drawThisImage = function () {
            ctx.drawImage(_this._imageElement, _this._position, noteHeight, _this._size.x, _this._size.y);
        };
        this.attacked = function () {
            if (!_this._isAttacked) {
                if (_this._position <= 50) {
                    _this._audioElement.play();
                    _this._isAttacked = true;
                }
            }
        };
        this._noteType = noteType;
        this._position = position;
        this._isAttacked = false;
        this._imageElement = new Image();
        this._audioElement = new Audio();
        switch (this._noteType) {
            case '1':
                this._imageElement.src = "赤玉.png";
                this._audioElement.src = "赤玉.mp3";
                // 音量を小さくする
                this._audioElement.volume -= 0.5;
                this._size = { x: 50, y: 50 };
                break;
            case '2':
                this._imageElement.src = "青玉.png";
                this._audioElement.src = "青玉.mp3";
                //　再生位置を後ろにする
                this._audioElement.currentTime = 0.2;
                this._size = { x: 50, y: 50 };
                break;
            default:
                this._imageElement.src = "no_image_logo.png";
                this._size = { x: 76, y: 49 };
                break;
        }
    }
    return noteClass;
}());
// インスタンス生成
var note = new Array();
// 譜面を読んで全てのノーツを配置
for (var i = 0; i < chart.length; i++) {
    for (var j = 0; j < chart[i].length; j++) {
        if (chart[i][j] !== '0') {
            note.push(new noteClass(chart[i][j], settingNotePosition));
        }
        settingNotePosition += Math.floor(48 / chart[i].length * interval48Length);
    }
}
// クリックするとノーツが動き出す
screenCanvas.addEventListener('click', function (e) {
    setInterval(movePosition, updateTime);
});
// スマホ用
// screenCanvas.addEventListener('touchstart', function (e) {
//     setInterval(movePosition, updateTime);
// });
// ノーツ移動のループ（setInterval）
var movePosition = function () {
    for (var i = 0; i < note.length; i++) {
        note[i].moveThisPosition();
        note[i].attacked();
    }
    drawAllImage();
};
// 全ての画像を描写する関数
var drawAllImage = function () {
    // Canvasをクリアする
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // 判定円を描写する
    ctx.strokeStyle = "rgba(255,255,255, 0.9)";
    ctx.arc(50, noteHeight + 25, 25, 0, Math.PI * 2, true);
    ctx.stroke();
    // 配列の末尾から画像を描写する
    for (var i = note.length - 1; i >= 0; i--)
        note[i].drawThisImage();
};
