// TypeScriptはどこかにexportがないと不機嫌になる
export{};

// screenの属性を受け取る
const screenCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('screen');
// 2dコンテキスト
const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>screenCanvas.getContext('2d');
// canvasのサイズ。clearRectで使う
const canvasWidth: number = <number><unknown>screenCanvas.getAttribute('width');
const canvasHeight: number = <number><unknown>screenCanvas.getAttribute('height');
// test
const test: HTMLElement = <HTMLElement>document.getElementById('test');
const test2: HTMLElement = <HTMLElement>document.getElementById('test2');

// 曲のBPM
const BPM: number = 200;
// 曲の譜面
const chart: string[] = ['10201120', '1011201020101120', '20102212', '1020112110102000', '1112121211121222', '1112121212212212', '1112111212211212', '1112111212121000'];
// 96分音符ごとに動かす(ミリ秒）
// 60BPMのときの1拍が1000ms、4拍が1小節、1小節を48等分すると48分音符
let updateTime = 60 / BPM * 1000 * 4 / 96; // 200BPMのとき12.5ms

// ノーツを表示するy座標
const noteHeight: number = 6;
// 48分音符同士のx座標の間隔（ピクセル）
// 48分音符が太鼓の譜面において最小の間隔
const interval48Length: number = 12;
// これから配置するノーツのx座標（ピクセル）
let settingNotePosition: number = 1000;

// 二次元要素オブジェクト
interface Point {
    x: number;
    y: number;
}
//////////////////////
// ---noteClass--- //
//////////////////////
class noteClass{
    private _noteType: string;
    private _position: number;
    private _size: Point;
    private _isAttacked: boolean;
    private _imageElement: HTMLImageElement;
    private _audioElement: HTMLAudioElement;

    constructor(noteType: string, position: number){
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
                this._audioElement.volume -= 0.5
                this._size = {x:50, y:50};
                break;
            case '2':
                this._imageElement.src = "青玉.png";
                this._audioElement.src = "青玉.mp3";
                //　再生位置を後ろにする
                this._audioElement.currentTime = 0.2;
                this._size = {x:50, y:50};
                break;
            default:
                this._imageElement.src = "no_image_logo.png";
                this._size = {x:76, y:49}
                break;
        }
    }

    public moveThisPosition = (): void =>{
        //  96分音符の間隔で移動する
        this._position -= interval48Length / 2;
    }

    public drawThisImage = (): void =>{
        ctx.drawImage(
            this._imageElement,
            this._position,
            noteHeight,
            this._size.x,
            this._size.y
        );
    }

    public attacked = (): void =>{
        if(!this._isAttacked){
            if(this._position <= 50){
                this._audioElement.play();
                this._isAttacked = true;
            }
        }
    }
}

// インスタンス生成
let note = new Array<noteClass>();
// 譜面を読んで全てのノーツを配置
for(let i = 0; i < chart.length; i++){
    for(let j = 0; j < chart[i].length; j++){
        if(chart[i][j] !== '0'){
            note.push(new noteClass(chart[i][j], settingNotePosition));
        }
        settingNotePosition += Math.floor(48 / chart[i].length * interval48Length);
    }
}

// クリックするとノーツが動き出す
screenCanvas.addEventListener('click', e =>{
    setInterval(movePosition, updateTime);
})
// スマホ用
screenCanvas.addEventListener('touchstart', e =>{
    setInterval(movePosition, updateTime);
})

// ノーツ移動のループ（setInterval）
let movePosition = () =>{
    for(let i = 0; i < note.length; i++){
        note[i].moveThisPosition();
        note[i].attacked();
    }
    drawAllImage();
}

// 全ての画像を描写する関数
let drawAllImage = () =>{
    // Canvasをクリアする
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // 判定円を描写する
    ctx.strokeStyle = "rgba(255,255,255, 0.9)";
    ctx.arc(50, noteHeight + 25, 25, 0, Math.PI * 2, true);
    ctx.stroke();
    // 配列の末尾から画像を描写する
    for(let i = note.length - 1; i >= 0; i--) note[i].drawThisImage();
}

