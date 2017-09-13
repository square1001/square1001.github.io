var cvs;
var context;
var dist, cleared;
var row, row_fixed;
var moves, cnt;
var dir;
var score, time_bonus;
var speed_var;
var coins;
var boost;
var mobx, mobr, mobc, mobf;
var coinx, coinr, coinf;
var IMG_ARRAY = new Array();
var IMG_SRC_ARRAY = new Array("highway.png", "car_mine.png", "car_red.png", "car_green.png", "car_blue.png", "goal.png");
var IMG_COUNT = IMG_SRC_ARRAY.length;
var IMG_CURRENT_COUNT = 0;
var IMG_HIGHWAY;
var IMG_CAR_MINE;
var IMG_CAR_RED;
var IMG_CAR_GREEN;
var IMG_CAR_BLUE;
var IMG_GOAL;
var MOVE_INTERVAL_VALUE;
var GOAL = 10000; // meter
var MOVE_PER_SEC = 30; // FPS
var MOB_SPEED = 20; // meter per second
var MAX_DEGREE = 40 / 180 * Math.PI;
var STATE = -1;
for (var i = 0; i < IMG_COUNT; i++) {
	IMG_ARRAY[i] = new Image();
	IMG_ARRAY[i].src = "img/" + IMG_SRC_ARRAY[i];
	IMG_ARRAY[i].onload = function () {
		IMG_CURRENT_COUNT++;
		if (IMG_CURRENT_COUNT == IMG_COUNT) {
			init();
		}
	}
}
document.onkeydown = function (event) {
	if (event.keyCode == 37 && STATE == 2 && Math.abs(row - row_fixed * 80) < 1.0e-7 && row_fixed >= 1) {
		dir = -MAX_DEGREE;
		row_fixed--;
	}
	if (event.keyCode == 39 && STATE == 2 && Math.abs(row - row_fixed * 80) < 1.0e-7 && row_fixed <= 3) {
		dir = MAX_DEGREE;
		row_fixed++;
	}
	if (event.keyCode == 32) {
		if (STATE == 0) game_start();
		if (STATE == 3) init();
	}
}
function speed() {
	return 500 / 3.6 * (1 - Math.pow(0.84, speed_var));
}
function init() {
	STATE = -1;
	cvs = document.getElementById("cvs");
	context = cvs.getContext("2d");
	init_img();
	STATE = 0;
	draw_start();
}
function game_start() {
	STATE = 1;
	init_var();
	MOVE_INTERVAL_VALUE = setInterval("move()", 1000 / MOVE_PER_SEC);
	STATE = 2;
}
function game_end() {
	STATE = 3;
	clearInterval(MOVE_INTERVAL_VALUE);
	time_bonus = Math.floor((0.032 * GOAL * GOAL) / ((moves / MOVE_PER_SEC) - GOAL / (600 / 3.6) * 0.3));
	draw_end();
}
function init_img() {
	IMG_HIGHWAY = IMG_ARRAY[0];
	IMG_CAR_MINE = IMG_ARRAY[1];
	IMG_CAR_RED = IMG_ARRAY[2];
	IMG_CAR_GREEN = IMG_ARRAY[3];
	IMG_CAR_BLUE = IMG_ARRAY[4];
	IMG_GOAL = IMG_ARRAY[5];
}
function init_var() {
	// --- SET INITIAL VARIABLES --- //
	moves = cnt = 0;
	dist = 0;
	cleared = false;
	row_fixed = 2;
	row = row_fixed * 80;
	dir = 0.0;
	speed_var = 0;
	coins = 0;
	score = time_bonus = 0;
	boost = 1;

	// --- SET PLACE OF MOBS --- //
	mobx = new Array();
	mobr = new Array();
	mobc = new Array();
	mobf = new Array();
	var pos_mob = 250;
	while (pos_mob < GOAL + 1000) {
		var l = pos_mob + 12;
		if (mobx.length >= 2) l = Math.max(l, mobx[mobx.length - 2] + 20);
		var r = l + Math.floor(45 * GOAL / (pos_mob + GOAL * 0.3));
		pos_mob = l + Math.floor(Math.random() * (r - l));
		mobx.push(pos_mob);
		mobr.push(Math.floor(Math.random() * 5));
		mobc.push(Math.floor(Math.random() * 3));
		mobf.push(true);
		while (mobr.length >= 2 && mobr[mobr.length - 2] == mobr[mobr.length - 1]) mobr[mobr.length - 1] = Math.floor(Math.random() * 5);
	}

	// --- SET PLACE OF COINS --- //
	coinx = new Array();
	coinr = new Array();
	coinf = new Array();
	var pos_coin = 150;
	while (pos_coin < GOAL + 1000) {
		var l = pos_coin + 10;
		var r = l + 400;
		if (coinx.length >= 1 && Math.random() < 0.8) {
			pos_coin = l;
			coinr.push(coinr[coinr.length - 1]);
		}
		else {
			pos_coin = l + Math.floor(Math.random() * (r - l));
			coinr.push(Math.floor(Math.random() * 5));
		}
		coinx.push(pos_coin);
		coinf.push(true);
	}
}
function move() {
	dist += speed() * Math.cos(dir) / MOVE_PER_SEC;
	row += speed() * 5 * Math.sin(dir) / MOVE_PER_SEC;
	if (Math.abs(dir) > 1.0e-7 && Math.abs(row - row_fixed * 80) < Math.abs(speed() * 5 * Math.sin(dir) / MOVE_PER_SEC)) {
		row = row_fixed * 80;
		dir = 0.0;
	}
	for (var i = 0; i < mobx.length; i++) {
		mobx[i] += MOB_SPEED / MOVE_PER_SEC;
	}
	cnt++;
	if (dist < GOAL) {
		speed_var += 1 / MOVE_PER_SEC;
		moves++;
	}
	else {
		if (cleared == false) cleared = true;
		if (speed_var > 0) speed_var *= Math.pow(0.5, 1.0 / MOVE_PER_SEC);
		if (speed_var < 1.0e-3) {
			speed_var = 0;
			game_end();
			return;
		}
	}
	var colm = collide_mob();
	if (colm != -1) {
		mobf[colm] = false;
		speed_var = Math.min(1, speed_var);
	}
	var colc = collide_coin();
	if (colc != -1) {
		coinf[colc] = false;
		coins++;
	}
	score = Math.floor(dist * 4 + coins * 50);
	draw();
}
function collide_mob() {
	for (var i = 0; i < mobx.length; i++) {
		var px = dist - mobx[i], py = row - mobr[i] * 80;
		if (mobf[i] && -20 < px && px < 20 && -25 <= py && py < 25) return i;
	}
	return -1;
}
function collide_coin() {
	for (var i = 0; i < coinx.length; i++) {
		var cx = coinx[i] - 24 / 5, cy = coinr[i] * 80;
		var dx = (dist - 20 <= cx && cx <= dist ? 0 : Math.min(Math.abs(cx - dist), Math.abs(cx - (dist - 20))));
		var dy = (row - 25 <= cy && cy <= row + 25 ? 0 : Math.min(Math.abs(cy - (row - 25)), Math.abs(cy - (row + 25))));
		if (coinf[i] && dx * dx + dy * dy / 25 <= 4.8 * 4.8) return i;
	}
	return -1;
}
function draw_start() {
	context.fillStyle = "#9999ff";
	context.fillRect(0, 0, 750, 500);
	context.fillStyle = "#333333";
	context.font = "normal bold 55px sans-serif";
	context.textAlign = "center";
	context.fillText("Simple Race Car Game", 375, 200);
	context.font = "normal normal 35px sans-serif";
	context.fillText("Press Space Key to Start", 375, 400);
}
function draw_end() {
	context.clearRect(0, 0, 750, 500);
	context.globalAlpha = 0.3;
	draw();
	context.globalAlpha = 1.0;
	context.fillStyle = "#333333";
	context.font = "normal bold 45px sans-serif";
	context.textAlign = "center";
	context.fillText("Results", 375, 100);
	context.font = "normal bold 35px sans-serif";
	context.fillText("Score: " + score, 375, 200);
	context.fillText("Time Bonus: " + time_bonus, 375, 250);
	context.fillText("Total Score: " + (score + time_bonus), 375, 330);
	context.fillText("Press Space Key to End", 375, 440);
}
function draw() {
	context.clearRect(0, 0, 750, 500);
	drawroad();
	drawsidebar();
}
function drawroad() {
	// --- Draw Map --- //
	context.drawImage(IMG_HIGHWAY, 0, 200 - (dist * 5) % 200, 500, 500, 0, 0, 500, 500);
	context.drawImage(IMG_GOAL, 50, dist * 5 - GOAL * 5 + 350, 400, 30);
	context.fillStyle = ""

	// --- Draw Coins --- //
	for (var i = 0; i < coinx.length; i++) {
		var px = dist * 5 - coinx[i] * 5 + 380 + 30;
		if (coinf[i] && -48 <= px && px <= 500) {
			context.fillStyle = "#ffff66";
			context.beginPath();
			context.arc(coinr[i] * 80 + 90, px, 24, Math.PI * 0 / 180, Math.PI * 360 / 180, false);
			context.fill();
			context.closePath();
		}
	}

	// --- Draw Mobs --- //
	for (var i = 0; i < mobx.length; i++) {
		var car_img;
		if (mobc[i] == 0) car_img = IMG_CAR_RED;
		if (mobc[i] == 1) car_img = IMG_CAR_GREEN;
		if (mobc[i] == 2) car_img = IMG_CAR_BLUE;
		var px = dist * 5 - mobx[i] * 5 + 380;
		if (-100 <= px && px <= 500 && (mobf[i] == true || cnt / MOVE_PER_SEC % 0.5 <= 0.25)) {
			context.drawImage(car_img, mobr[i] * 80 + 65, px, 50, 100);
		}
	}

	// --- Draw Car --- //
	context.drawImage(IMG_CAR_MINE, row + 65, 380, 50, 100);
}
function drawsidebar() {
	context.strokeStyle = "#ffdd99";
	context.fillStyle = "#ffcccc";
	context.fillRect(500, 0, 250, 500);
	context.strokeRect(500, 0, 250, 140);
	context.strokeRect(500, 140, 250, 240);
	context.strokeRect(500, 380, 250, 120);
	context.font = "italic bold 50px fantasy";
	context.fillStyle = "#333333";
	context.textAlign = "left";
	context.fillText("SCORE:", 510, 50);
	context.textAlign = "right";
	context.fillText(score, 730, 120);
	context.textAlign = "left";
	context.font = "normal normal 22px sans-serif"
	context.fillText("Time(sec): " + Math.floor(moves / MOVE_PER_SEC * 100) / 100, 510, 175);
	context.fillText("Distance(m): " + Math.min(Math.floor(dist), GOAL), 510, 215);
	// context.fillText("Boost  x" + boost, 510, 255);
	// context.fillText("Invinc.  x" + invinc, 625, 340);
	context.font = "25px fantasy";
	context.textAlign = "left";
	context.fillText("Speed:  " + Math.round(speed() * 3.6) + "km/h", 510, 420);
	var grd = context.createLinearGradient(520, 0, 730, 0);
	grd.addColorStop(0, "orange");
	grd.addColorStop(1, "red");
	context.fillStyle = grd;
	context.fillRect(520, 440, 210 * (speed() * 3.6 / 600), 40);
	context.strokeStyle = "#555555";
	context.strokeRect(520, 440, 210, 40);
}