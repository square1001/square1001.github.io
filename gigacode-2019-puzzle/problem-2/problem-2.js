// ---- Connecting with Canvas from HTML ---- //
var cvs = document.getElementById("cvs");
var context = cvs.getContext("2d");

// ---- Loading Images ---- //
const IMG_SRC_ARRAY = [
	"img/road.png",
	"img/house.png",
	"img/dog.png",
	"img/correct.png",
	"img/incorrect.png",
	"img/flag.png"
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
var IMG_ROAD = IMG_ARRAY[0];
var IMG_HOUSE = IMG_ARRAY[1];
var IMG_DOG = IMG_ARRAY[2];
var IMG_CORRECT = IMG_ARRAY[3];
var IMG_INCORRECT = IMG_ARRAY[4];
var IMG_FLAG = IMG_ARRAY[5];

// ---- Constants ---- //
const H = cvs.height;
const W = cvs.width;
const N = 10;
const TREE_LIMIT = 9;
const sx = 0, sy = 0;
const dx = [ 0, 1, 0, -1 ];
const dy = [ 1, 0, -1, 0 ];
const cell_size = (H * 0.8) / N;

// ---- Main Part ---- //
var board;
var candx, candy;
var highest_score = get_highest_score(2);
var question_count;
var played_count = get_played_count();
var play_mode = -1;
document.body.onunload = function() {
	if(question_count == 0) {
		set_played_count(played_count - 1);
	}
}
document.onmousedown = function() {
	if(play_mode == -1) return;
	var px = event.pageX - cvs.offsetLeft;
	var py = event.pageY - cvs.offsetTop;
	var sr = -1, sc = -1;
	for(var i = 0; i < N; ++i) {
		for(var j = 0; j < N; ++j) {
			var tr = H * 0.1 + cell_size * i;
			var tc = H * 0.1 + cell_size * j;
			if(tc + 1 <= px && px < tc + cell_size - 1 && tr + 1 <= py && py < tr + cell_size - 1) {
				sr = i, sc = j;
			}
		}
	}
	if(sr == -1 && sc == -1) return; // out of range
	if(sr == 0 && sc == 0) return; // collides with the dog
	var on_count = 0;
	for(var i = 0; i < N; ++i) {
		for(var j = 0; j < N; ++j) {
			if(board[i][j] == '#') {
				++on_count;
			}
		}
	}
	on_count += (board[sr][sc] == '.' ? 1 : -1);
	var on_limit = (play_mode == 0 ? TREE_LIMIT : 1);
	if(on_count <= on_limit) {
		board[sr] = board[sr].substring(0, sc) + (board[sr][sc] == '.' ? '#' : '.') + board[sr].substring(sc + 1, N);
		draw();
	}
}
function initialize() {
	if(played_count >= PLAY_LIMIT) {
		window.alert("プレイ回数制限に達しました。別の問題に挑戦しましょう。");
		window.location.href = "../index.html";
		return;
	}
	play_mode = 0;
	board = new Array(N);
	for(var i = 0; i < N; ++i) {
		board[i] = ".".repeat(N);
	}
	question_count = 0;
	set_played_count(played_count + 1);
	candx = [], candy = [];
	for(var i = 0; i < N; ++i) {
		for(var j = 0; j < N; ++j) {
			if(i != 0 || j != 0) {
				candx.push(i);
				candy.push(j);
			}
		}
	}
	draw();
	print_status();
}
function switch_mode() {
	if(play_mode == -1) return;
	if(play_mode == 0) {
		play_mode = 1;
		for(var i = 0; i < N; ++i) {
			board[i] = ".".repeat(N);
		}
		print_status();
		draw();
		return;
	}
	if(play_mode == 1) {
		play_mode = 0;
		for(var i = 0; i < N; ++i) {
			board[i] = ".".repeat(N);
		}
		print_status();
		draw();
		return;
	}
}
function reset() {
	if(played_count >= PLAY_LIMIT) {
		document.getElementById("query-message").innerHTML = "プレイ回数制限に達しました。別の問題に挑戦しましょう。";
		return;
	}
	initialize();
}
function query(x, y) {
	if(play_mode == -1) return;
	document.getElementById("query-message").innerHTML = "";
	px = [], py = [];
	for(var i = 0; i < N; ++i) {
		for(var j = 0; j < N; ++j) {
			if(board[i][j] == '#') {
				px.push(i);
				py.push(j);
			}
		}
	}
	if(px.length == 0) {
		document.getElementById("query-message").innerHTML = "1 マスも選択されていません。";
		return;
	}
	if(play_mode == 0) {
		++question_count;
		vis = new Array(N);
		for(var i = 0; i < N; ++i) {
			vis[i] = new Array(N);
			for(var j = 0; j < N; ++j) {
				vis[i][j] = false;
			}
		}
		var quex = [ sx ], quey = [ sy ], ql = 0;
		vis[sx][sy] = true;
		while(ql < quex.length) {
			var ux = quex[ql], uy = quey[ql]; ++ql;
			for(var i = 0; i < 4; ++i) {
				var tx = ux + dx[i], ty = uy + dy[i];
				if(0 <= tx && tx < N && 0 <= ty && ty < N && board[tx][ty] == '.' && !vis[tx][ty]) {
					vis[tx][ty] = true;
					quex.push(tx);
					quey.push(ty);
				}
			}
		}
		var cnt_ok = 0, cnt_ng = 0;
		for(var i = 0; i < candx.length; ++i) {
			var coeff = 2;
			if(1 <= candx[i] && candx[i] < N - 1 && 1 <= candy[i] && candy[i] < N - 1) coeff = 3;
			if(3 <= candx[i] && candx[i] < N - 3 && 3 <= candy[i] && candy[i] < N - 3) coeff = 4;
			if(vis[candx[i]][candy[i]]) cnt_ok += coeff;
			else cnt_ng += coeff;
		}
		var prob_ok = (cnt_ok * cnt_ok) / (cnt_ok * cnt_ok + cnt_ng * cnt_ng);
		var reach = false;
		if(Math.random() < prob_ok) reach = true;
		context.globalAlpha = 0.4;
		for(var i = 0; i < N; ++i) {
			for(var j = 0; j < N; ++j) {
				if(i == 0 && j == 0) continue;
				var cx = H * 0.1 + cell_size * i;
				var cy = H * 0.1 + cell_size * j;
				if(reach && vis[i][j]) {
					context.fillStyle = "#FF2222";
					context.fillRect(cy + 1, cx + 1, cell_size - 2, cell_size - 2);
				}
				if(!reach && !vis[i][j]) {
					context.fillStyle = "#2222FF";
					context.fillRect(cy + 1, cx + 1, cell_size - 2, cell_size - 2);
				}
			}
		}
		context.globalAlpha = 1.0;
		var ncandx = [], ncandy = [];
		for(var i = 0; i < candx.length; ++i) {
			if(reach && vis[candx[i]][candy[i]]) {
				ncandx.push(candx[i]);
				ncandy.push(candy[i]);
			}
			if(!reach && !vis[candx[i]][candy[i]]) {
				ncandx.push(candx[i]);
				ncandy.push(candy[i]);
			}
		}
		candx = ncandx.slice(0);
		candy = ncandy.slice(0);
		if(reach) {
			document.getElementById("query-message").innerHTML = "ギガコード君の場所にたどり着けます！";
		}
		else {
			document.getElementById("query-message").innerHTML = "ギガコード君の場所にたどり着けません...";
		}
		print_status();
	}
	if(play_mode == 1) {
		answer(px[0], py[0]);
	}
}
function answer(x, y) {
	var scx = H * 0.1 + cell_size * x;
	var scy = H * 0.1 + cell_size * y;
	if(candx.length == 1 && candx[0] == x && candy[0] == y) {
		// GAME CLEAR
		context.drawImage(IMG_CORRECT, scy + 1, scx + 1, cell_size - 2, cell_size - 2);
		document.getElementById("query-message").innerHTML = "正解です！";
		var newscore = getscore(question_count);
		if(highest_score < newscore) {
			set_highest_score(newscore);
		}
		play_mode = -1;
	}
	else {
		// INCORRECT
		context.drawImage(IMG_INCORRECT, scy + 1, scx + 1, cell_size - 2, cell_size - 2);
		document.getElementById("query-message").innerHTML = "残念ながら不正解です。";
		++question_count;
		var ncandx = [], ncandy = [];
		for(var i = 0; i < candx.length; ++i) {
			if(candx[i] != x || candy[i] != y) {
				ncandx.push(candx[i]);
				ncandy.push(candy[i]);
			}
		}
		candx = ncandx.slice(0);
		candy = ncandy.slice(0);
	}
}
function draw() {
	// ---- Clear All ---- //
	context.clearRect(0, 0, W, H);
	// ---- Draw Outer Walls ---- //
	context.fillStyle = "#080808";
	context.fillRect(H * 0.05, H * 0.05, H * 0.9, H * 0.9);
	// ---- Draw Inner Places ---- //
	for(var i = 0; i < N; ++i) {
		for(var j = 0; j < N; ++j) {
			var cx = H * 0.1 + cell_size * i;
			var cy = H * 0.1 + cell_size * j;
			context.strokeStyle = "#131313";
			context.strokeRect(cy, cx, cell_size, cell_size);
			context.drawImage(IMG_ROAD, cy + 1, cx + 1, cell_size - 2, cell_size - 2);
			if(board[i][j] == '#') {
				context.drawImage((play_mode == 0 ? IMG_HOUSE : IMG_FLAG), cy + 1, cx + 1, cell_size - 2, cell_size - 2);
			}
		}
	}
	var scx = H * 0.1 + cell_size * sx;
	var scy = H * 0.1 + cell_size * sy;
	context.drawImage(IMG_DOG, scy + 1, scx + 1, cell_size - 2, cell_size - 2);
}
function print_status() {
	document.getElementById("highest-score").innerHTML = highest_score;
	document.getElementById("question-count").innerHTML = question_count;
	document.getElementById("remain-count").innerHTML = PLAY_LIMIT - played_count;
	if(play_mode == -1) {
		document.getElementById("submit-button").style.display = "none";
		document.getElementById("mode-switch-button").style.display = "none";
	}
	else {
		document.getElementById("submit-button").style.display = "block";
		document.getElementById("mode-switch-button").style.display = "block";
		if(play_mode == 0) {
			document.getElementById("submit-button").innerHTML = "質問！";
			document.getElementById("mode-switch-button").innerHTML = "解答モードに切り替え";
		}
		if(play_mode == 1) {
			document.getElementById("submit-button").innerHTML = "解答！";
			document.getElementById("mode-switch-button").innerHTML = "質問モードに切り替え";
		}
	}
}
function getscore(qcnt) {
	if(qcnt <= 7) return 100;
	if(qcnt <= 8) return 91;
	if(qcnt <= 9) return 82;
	if(qcnt <= 10) return 73;
	if(qcnt <= 11) return 64;
	if(qcnt <= 13) return 55;
	if(qcnt <= 16) return 46;
	if(qcnt <= 24) return 37;
	return 30;
}
function set_played_count(cnt) {
	played_count = cnt;
	var dt = new Date();
	dt.setTime(dt.getTime() + 365 * 86400 * 1000);
	document.cookie = "playedcnt2=" + encodeURIComponent(String(played_count)) + "; expires=" + dt.toUTCString() + "; path=/";
	print_status();
}
function set_highest_score(score) {
	highest_score = score;
	var dt = new Date();
	dt.setTime(dt.getTime() + 365 * 86400 * 1000);
	document.cookie = "highscore2=" + encodeURIComponent(String(highest_score)) + "; expires=" + dt.toUTCString() + "; path=/";
	print_status();
}