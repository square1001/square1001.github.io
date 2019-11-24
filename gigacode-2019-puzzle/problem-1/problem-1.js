// ---- Connecting with Canvas from HTML ---- //
var cvs = document.getElementById("cvs");
var context = cvs.getContext("2d");

// ---- Loading Images ---- //
const IMG_SRC_ARRAY = [
	"img/road.png",
	"img/tree.png",
	"img/flag.png",
	"img/sniper-right.png",
	"img/sniper-down.png",
	"img/sniper-left.png",
	"img/sniper-up.png",
	"img/bullet.png"
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
var IMG_TREE = IMG_ARRAY[1];
var IMG_FLAG = IMG_ARRAY[2];
var IMG_SNIPER = [ IMG_ARRAY[3], IMG_ARRAY[4], IMG_ARRAY[5], IMG_ARRAY[6] ];
var IMG_BULLET = IMG_ARRAY[7];

// ---- Constants ---- //
const H = cvs.height;
const W = cvs.width;
const N = 10;
const initial_board = [
	"S.###....#",
	"##...###..",
	".#.###..#.",
	"###.#..##.",
	"..###..#..",
	"...#.#.#.#",
	"..##..#...",
	".#.#.#...#",
	"##..#.####",
	"...#.##.#G"
];
const dx = [ 0, 1, 0, -1 ]
const dy = [ 1, 0, -1, 0 ]

// ---- Main Part ---- //
var board;
var sx, sy, tx, ty, sd, gx, gy, gd;
var highest_score, firing_count, moving_count;
var iv_adjust_cell, iv_adjust_bullet;
var completed;
function initialize() {
	board = new Array(N);
	for(var i = 0; i < N; ++i) {
		board[i] = initial_board[i].slice(0);
	}
	completed = false;
	sx = -1, sy = -1;
	for(var i = 0; i < N; ++i) {
		for(var j = 0; j < N; ++j) {
			if(board[i][j] == 'S') {
				sx = i, sy = j;
			}
		}
	}
	tx = sx, ty = sy;
	sd = 0;
	gx = [];
	gy = [];
	gd = [];
	moving_count = 0;
	firing_count = 0;
	highest_score = get_highest_score(1);
	clearInterval(iv_adjust_cell);
	clearInterval(iv_adjust_bullet);
	document.getElementById("cleared-message").innerHTML = "";
	draw();
	print_status();
}
function adjust_cell() {
	tx += dx[sd] * 0.1;
	ty += dy[sd] * 0.1;
	if(Math.abs(tx - sx) + Math.abs(ty - sy) <= 0.01) {
		tx = sx;
		ty = sy;
		clearInterval(iv_adjust_cell);
		if(board[tx][ty] == 'G') {
			completed = true;
			var newscore = getscore(firing_count, moving_count);
			document.getElementById("cleared-message").innerHTML = "クリア！ 得点 " + String(newscore);
			if(highest_score < newscore) {
				set_highest_score(newscore);
			}
		}
	}
	draw();
}
function adjust_bullet() {
	var rem = [];
	for(var i = 0; i < gd.length; ++i) {
		gx[i] += dx[gd[i]] * 0.1;
		gy[i] += dy[gd[i]] * 0.1;
		if(0 <= gx[i] && gx[i] < N && 0 <= gy[i] && gy[i] < N) {
			var cx = Math.floor(gx[i]);
			var cy = Math.floor(gy[i]);
			if(board[cx][cy] == '#' && 0.3 <= gx[i] - cx && gx[i] - cx <= 0.7 && 0.3 <= gy[i] - cy && gy[i] - cy <= 0.7) {
				board[cx] = board[cx].substring(0, cy) + "." + board[cx].substring(cy + 1, N);
			}
			else {
				rem.push(i);
			}
		}
	}
	var ngx = [], ngy = [], ngd = [];
	for(var i = 0; i < rem.length; ++i) {
		ngx.push(gx[rem[i]]);
		ngy.push(gy[rem[i]]);
		ngd.push(gd[rem[i]]);
	}
	gx = ngx.slice(0), gy = ngy.slice(0), gd = ngd.slice(0);
	if(gd.length == 0) {
		clearInterval(iv_adjust_bullet);
	}
	draw();
}
function move_cell(dir) {
	if(tx != sx || ty != sy) return;
	if(sd != dir) {
		sd = dir;
		draw();
		return;
	}
	if(completed) return;
	var nx = sx + dx[dir];
	var ny = sy + dy[dir];
	if(0 <= nx && nx < N && 0 <= ny && ny < N && board[nx][ny] != '#') {
		sx = nx;
		sy = ny;
		++moving_count;
		iv_adjust_cell = setInterval("adjust_cell()", 20);
	}
	print_status();
}
function move_right() {
	move_cell(0);
}
function move_down() {
	move_cell(1);
}
function move_left() {
	move_cell(2);
}
function move_up() {
	move_cell(3);
}
function fire_gun() {
	if(completed) return;
	if(gd.length >= 1) return;
	gx.push(tx + 0.5);
	gy.push(ty + 0.5);
	gd.push(sd);
	iv_adjust_bullet = setInterval("adjust_bullet()", 10);
	++firing_count;
	print_status();
}
function reset() {
	initialize();
}
function print_status() {
	document.getElementById("highest-score").innerHTML = highest_score;
	document.getElementById("firing-count").innerHTML = firing_count;
	document.getElementById("moving-count").innerHTML = moving_count;
}
function draw() {
	// ---- Clear All ---- //
	context.clearRect(0, 0, W, H);
	// ---- Draw Outer Walls ---- //
	context.fillStyle = "#080808";
	context.fillRect(H * 0.05, H * 0.05, H * 0.9, H * 0.9);
	// ---- Draw Inner Places ---- //
	var cell_size = (H * 0.8) / N;
	for(var i = 0; i < N; ++i) {
		for(var j = 0; j < N; ++j) {
			var cx = H * 0.1 + cell_size * i;
			var cy = H * 0.1 + cell_size * j;
			context.strokeStyle = "#131313";
			context.strokeRect(cy, cx, cell_size, cell_size);
			if(board[i][j] == '#') {
				// ---- Draw Tree ---- //
				context.drawImage(IMG_TREE, cy + 1, cx + 1, cell_size - 2, cell_size - 2);
			}
			else {
				// ---- Draw Road ---- //
				context.drawImage(IMG_ROAD, cy + 1, cx + 1, cell_size - 2, cell_size - 2);
			}
			if(board[i][j] == 'G') {
				// ---- Draw Flag ---- //
				context.drawImage(IMG_FLAG, cy + 1, cx + 1, cell_size - 2, cell_size - 2);
			}
		}
	}
	var scx = H * 0.1 + cell_size * tx;
	var scy = H * 0.1 + cell_size * ty;
	context.drawImage(IMG_SNIPER[sd], scy + 1, scx + 1, cell_size - 2, cell_size - 2);
	for(var i = 0; i < gd.length; ++i) {
		var bcx = H * 0.1 + cell_size * gx[i];
		var bcy = W * 0.1 + cell_size * gy[i];
		context.drawImage(IMG_BULLET, bcy - cell_size * 0.15, bcx - cell_size * 0.15, cell_size * 0.3, cell_size * 0.3);
	}
}
function getscore(fcnt, mcnt) {
	var res = 0;
	if(fcnt <= 4) res += 100;
	else if(fcnt == 5) res += 85;
	else if(fcnt == 6) res += 70;
	else if(fcnt == 7) res += 60;
	else if(fcnt == 8) res += 50;
	else if(fcnt <= 10) res += 40;
	else if(fcnt == 15) res += 30;
	else res += 20;
	if(mcnt <= 18) res += 4;
	else if(mcnt <= 20) res += 2;
	else if(mcnt <= 22) res += 0;
	else if(mcnt <= 24) res -= 1;
	else if(mcnt <= 26) res -= 2;
	else if(mcnt <= 30) res -= 3;
	else if(mcnt <= 40) res -= 4;
	else res -= 5;
	return res;
}
function set_highest_score(score) {
	highest_score = score;
	var dt = new Date();
	dt.setTime(dt.getTime() + 365 * 86400 * 1000);
	document.cookie = "highscore1=" + encodeURIComponent(String(highest_score)) + "; expires=" + dt.toUTCString() + "; path=/";
	print_status();
}