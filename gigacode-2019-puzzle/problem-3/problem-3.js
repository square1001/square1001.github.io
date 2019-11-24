// ---- Connecting with Canvas from HTML ---- //
var cvs = document.getElementById("cvs");
var context = cvs.getContext("2d");

// ---- Images ---- //
const IMG_SRC_ARRAY = [
	"img/person-c.png",
	"img/person-o.png",
	"img/person-d.png",
	"img/person-e.png"
];
const IMG_NUMBER = IMG_SRC_ARRAY.length;
var IMG_ARRAY = new Array(IMG_NUMBER);
var IMG_LOADED = 0;
for(var i = 0; i < IMG_NUMBER; ++i) {
	IMG_ARRAY[i] = new Image();
	IMG_ARRAY[i].src = IMG_SRC_ARRAY[i];
	IMG_ARRAY[i].onload = function() {
		++IMG_LOADED;
		if(IMG_LOADED == IMG_NUMBER) {
			initialize();
		}
	};
}
var IMG_PERSON = [ IMG_ARRAY[0], IMG_ARRAY[1], IMG_ARRAY[2], IMG_ARRAY[3] ];

// ---- Constants ---- //
const H = cvs.height;
const W = cvs.width;
const LIMIT = 1000;
const cashH = 22;
const cashW = 40;
const N = 24;
const A = [ 123, 130, 171, 190, 213, 223, 250, 251, 259, 271, 284, 302, 324, 327, 339, 346, 350, 359, 360, 371, 381, 388, 389, 399 ];
const collist = [ "#ff70ff", "#7070ff", "#ff7070", "#ffff70", "#70ff70" ];
const bordercollist = [ "#ff00ff", "#0000ff", "#ff0000", "#ffff00", "#00ff00" ];

// ---- Variables / Initialization ---- //
var highest_score = get_highest_score(3);
var cashx, cashy, cashcol;
var dragging, relx, rely;
function initialize() {
	var vis = new Array(N);
	for(var i = 0; i < N; ++i) vis[i] = false;
	var p = [], pcnt = 0;
	while(pcnt < N) {
		var pos = Math.floor(Math.random() * N);
		if(!vis[pos]) {
			vis[pos] = true;
			p.push(pos);
			++pcnt;
		}
	}
	cashx = new Array(N);
	cashy = new Array(N);
	cashcol = new Array(N);
	for(var i = 0; i < N; ++i) {
		var cx = Math.floor(p[i] / 8), cy = p[i] % 8;
		cashx[i] = H * (0.81 + cx * 0.06);
		cashy[i] = W * (0.115 + cy * 0.11);
		cashcol[i] = i % 5;
	}
	dragging = -1, relx = 0, rely = 0;
	document.getElementById("query-message").innerHTML = "";
	print_status();
	draw();
}

// ---- Drag Operations Part ---- //
document.onmousedown = function() {
	var px = event.pageX - cvs.offsetLeft;
	var py = event.pageY - cvs.offsetTop;
	if(px < 0 || W <= px && py < 0 || H <= py) return;
	for(var i = 0; i < N; ++i) {
		if(cashx[i] - cashH / 2 <= py && py <= cashx[i] + cashH / 2 && cashy[i] - cashW / 2 <= px && px <= cashy[i] + cashW / 2) {
			dragging = i;
			break;
		}
	}
	if(dragging == -1) return;
	relx = cashx[dragging] - py;
	rely = cashy[dragging] - px;
}
document.onmousemove = function() {
	var px = event.pageX - cvs.offsetLeft;
	var py = event.pageY - cvs.offsetTop;
	if(px < 0 || W <= px && py < 0 || H <= py) return;
	var tx = py + relx;
	var ty = px + rely;
	var finflag = false;
	if(tx < cashH / 2) tx = cashH / 2, finflag = true;
	if(tx > H - cashH / 2) tx = H - cashH / 2, finflag = true;
	if(ty < cashW / 2) ty = cashW / 2, finflag = true;
	if(ty > W - cashW / 2) ty = W - cashW / 2, finflag = true;
	cashx[dragging] = tx;
	cashy[dragging] = ty;
	if(finflag) {
		dragging = -1;
	}
	print_status();
	draw();
}
document.onmouseup = function() {
	dragging = -1;
}

// ---- Answer Part ---- //
function answer() {
	document.getElementById("query-message").innerHTML = "";
	var money = count_money();
	var violated = [], sum = 0;
	for(var i = 0; i < 4; ++i) {
		if(money[i] < LIMIT) {
			violated.push(i);
		}
		sum += money[i];
	}
	if(violated.length >= 1) {
		var code_str = "CODE";
		var msg = "";
		for(var i = 0; i < violated.length; ++i) {
			if(i >= 1) msg += "、";
			msg += code_str[violated[i]] + "君";
		}
		msg += " に " + String(LIMIT) + " ドル以上の給料を渡していません。";
		document.getElementById("query-message").innerHTML = msg;
	}
	else {
		var newscore = getscore(sum);
		var msg = "合計金額 " + String(sum) + " ドル、得点 " + getscore(sum);
		document.getElementById("query-message").innerHTML = msg;
		if(highest_score < newscore) {
			set_highest_score(newscore);
		}
		print_status();
	}
}

// ---- Reset Part ---- //
function reset() {
	initialize();
}

// ---- Draw Part ---- //
function draw() {
	context.clearRect(0, 0, W, H);
	context.fillStyle = "#dddddd";
	context.fillRect(0, 0, W, H);
	context.fillStyle = "#777777";
	context.fillRect(W * 0.06, H * 0.78, W * 0.88, H * 0.18);
	for(var i = 0; i < 3; ++i) {
		for(var j = 0; j < 8 && i * 8 + j < N; ++j) {
			context.strokeStyle = "#151515";
			context.strokeRect(W * (0.06 + j * 0.11), H * (0.78 + i * 0.06), W * 0.11, H * 0.06);
		}
	}
	var money = count_money();
	context.font = "normal 35px sans-serif";
	for(var i = 0; i < 4; ++i) {
		context.fillStyle = "#999999";
		context.fillRect(W * 0.2, H * (0.06 + i * 0.18), W * 0.52, H * 0.12);
		context.strokeStyle = "#151515";
		context.strokeRect(W * 0.2, H * (0.06 + i * 0.18), W * 0.52, H * 0.12);
		context.drawImage(IMG_PERSON[i], W * 0.06, H * (0.05 + i * 0.18), W * 0.1, H * 0.14);
		context.fillStyle = (money[i] < LIMIT ? "#2222ff" : "#ff2222");
		context.fillText("$" + String(money[i]), W * 0.76, H * (0.143 + i * 0.18));
	}
	context.font = "normal bold 13px sans-serif";
	for(var i = 0; i < N; ++i) {
		context.fillStyle = collist[cashcol[i]];
		context.fillRect(cashy[i] - cashW / 2, cashx[i] - cashH / 2, cashW, cashH);
		context.strokeStyle = bordercollist[cashcol[i]];
		context.strokeRect(cashy[i] - cashW / 2, cashx[i] - cashH / 2, cashW, cashH);
		context.fillStyle = "#222222";
		context.fillText("$" + String(A[i]), cashy[i] - cashW * 0.43, cashx[i] + cashH * 0.23);
	}
}

// ---- Print Status Part ---- //
function print_status() {
	document.getElementById("highest-score").innerHTML = highest_score;
	var money = count_money(), sum = 0;
	for(var i = 0; i < 4; ++i) {
		sum += money[i];
	}
	document.getElementById("total-money").innerHTML = sum;
}

// ---- Counting Money Part ---- //
function intersect_area(xa, ya, xb, yb, xp, yp, xq, yq) {
	var xl = Math.max(xa, xp);
	var xr = Math.min(xb, xq);
	var yl = Math.max(ya, yp);
	var yr = Math.min(yb, yq);
	if(xl >= xr || yl >= yr) return 0;
	return (xr - xl) * (yr - yl);
}
function count_money() {
	var res = [ 0, 0, 0, 0 ];
	for(var i = 0; i < N; ++i) {
		var xa = cashx[i] - cashH / 2;
		var ya = cashy[i] - cashW / 2;
		var xb = cashx[i] + cashH / 2;
		var yb = cashy[i] + cashW / 2;
		for(var j = 0; j < 4; ++j) {
			var xp = H * (0.06 + j * 0.18);
			var yp = W * 0.2;
			var xq = H * (0.18 + j * 0.18);
			var yq = W * 0.72;
			var area = intersect_area(xa, ya, xb, yb, xp, yp, xq, yq);
			if(area >= cashH * cashW / 2) {
				res[j] += A[i];
			}
		}
	}
	return res;
}

// ---- Main Part ---- //
function getscore(psum) {
	var res = 0;
	if(psum <= 4000) res = 100;
	else if(psum <= 4010) res = 100 - (psum - 4000);
	else if(psum <= 4030) res = 90 - (psum - 4010) / 2;
	else if(psum <= 4060) res = 80 - (psum - 4030) / 3;
	else if(psum <= 4120) res = 70 - (psum - 4060) / 6;
	else if(psum <= 4200) res = 60 - (psum - 4120) / 8;
	else if(psum <= 4400) res = 50 - (psum - 4200) / 20;
	else if(psum <= 4700) res = 40 - (psum - 4400) / 30;
	else if(psum <= 5000) res = 30 - (psum - 4700) / 30;
	else if(psum <= 5500) res = 20 - (psum - 5000) / 50;
	else if(psum <= 7000) res = 10 - (psum - 5500) / 1500 * 9;
	else res = 1;
	res = Math.floor(res);
	return res;
}
function set_highest_score(score) {
	highest_score = score;
	var dt = new Date();
	dt.setTime(dt.getTime() + 365 * 86400 * 1000);
	document.cookie = "highscore3=" + encodeURIComponent(String(highest_score)) + "; expires=" + dt.toUTCString() + "; path=/";
	print_status();
}