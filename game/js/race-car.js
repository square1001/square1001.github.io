// --- INITIALIZE CONSTANTS --- //
var IMG_ARRAY = new Array();
var IMG_SRC_ARRAY = [
	"highway.png",
	"car_mine.png",
	"car_red.png",
	"car_green.png",
	"car_blue.png",
	"goal.png",
	"coin.png",
	"boost.png",
	"startpage.PNG"
];
var IMG_COUNT = IMG_SRC_ARRAY.length;
var IMG_CURRENT_COUNT = 0;
var IMG_HIGHWAY;
var IMG_CAR_MINE;
var IMG_CAR_RED;
var IMG_CAR_GREEN;
var IMG_CAR_BLUE;
var IMG_GOAL;
var IMG_COIN;
var IMG_BOOST;
var IMG_STARTPAGE;
var MOVE_INTERVAL_VALUE;
var GOAL = 10000; // meter
var MOVE_PER_SEC = 50; // FPS
var MOB_SPEED = 27 / 3.6; // meter per second
var MAX_DEGREE = 40 / 180 * Math.PI;
var BOOST_TIME = 5;

// --- INITIALIZE VARIABLES --- //
var STATE = -1;
var cvs;
var context;
var dist, cleared;
var row, row_fixed;
var moves, cnt;
var dir;
var score, time_bonus;
var speed_var;
var get_coins;
var boost, get_boosts;
var mobx, mobr, mobc, mobf;
var coinx, coinr, coinf;
var boostx, boostr, boostf;

// --- SETUP IMAGES --- //
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
IMG_HIGHWAY = IMG_ARRAY[0];
IMG_CAR_MINE = IMG_ARRAY[1];
IMG_CAR_RED = IMG_ARRAY[2];
IMG_CAR_GREEN = IMG_ARRAY[3];
IMG_CAR_BLUE = IMG_ARRAY[4];
IMG_GOAL = IMG_ARRAY[5];
IMG_COIN = IMG_ARRAY[6];
IMG_BOOST = IMG_ARRAY[7];
IMG_STARTPAGE = IMG_ARRAY[8];

// --- MOUSEDOWN FUNCTION --- //
document.onmousedown = function (event) {
	var sx = event.pageX - cvs.offsetLeft;
	var sy = event.pageY - cvs.offsetTop;
	if (STATE == 0) {
		if (245 <= sx && sx <= 505 && 240 <= sy && sy <= 300) game_start();
		if (245 <= sx && sx <= 505 && 320 <= sy && sy <= 380) ranking_page();
		if (245 <= sx && sx <= 505 && 400 <= sy && sy <= 460) window.close();
	}
	if (STATE == 3 || STATE == 4) {
		if (245 <= sx && sx <= 505 && 400 <= sy && sy <= 460) start_page();
	}
}

// --- KEYDOWN FUNCTION --- //
document.onkeydown = function (event) {
	if (event.keyCode == 37 && STATE == 2 && Math.abs(row - row_fixed * 80) < 1.0e-7 && row_fixed >= 1) {
		dir = -MAX_DEGREE;
		row_fixed--;
	}
	if (event.keyCode == 39 && STATE == 2 && Math.abs(row - row_fixed * 80) < 1.0e-7 && row_fixed <= 3) {
		dir = MAX_DEGREE;
		row_fixed++;
	}
}

// --- SPEED FUNCTION --- //
function speed() {
	return 500 / 3.6 * (1 - Math.pow(0.84, speed_var)) * (boost > 1.0e-7 ? 1.2 : 1);
}

// --- INITIALIZE CANVAS --- //
function init() {
	STATE = -1;
	cvs = document.getElementById("cvs");
	context = cvs.getContext("2d");
	start_page();
}

// --- START PAGE --- // 
function start_page() {
	STATE = 0;
	draw_start();
}

// --- GAME START --- //
function game_start() {
	STATE = 1;
	init_var();
	MOVE_INTERVAL_VALUE = setInterval("move()", 1000 / MOVE_PER_SEC);
	STATE = 2;
}

// --- GAME END --- //
function game_end() {
	STATE = 3;
	clearInterval(MOVE_INTERVAL_VALUE);
	time_bonus = Math.floor((0.032 * GOAL * GOAL) / ((moves / MOVE_PER_SEC) - GOAL / (600 / 3.6) * 0.3));
	set_ranking(score + time_bonus);
	draw_end();
}

// --- RANKING PAGE --- //
function ranking_page() {
	STATE = 4;
	drawranking();
}

// --- INITIALIZE VARIABLES --- //
function init_var() {
	// --- set initial variables --- //
	moves = cnt = 0;
	dist = 0;
	cleared = false;
	row_fixed = 2;
	row = row_fixed * 80;
	dir = 0.0;
	speed_var = 0;
	get_coins = 0;
	get_boosts = 0;
	score = time_bonus = 0;
	boost = 0;

	// --- set place of mobs --- //
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

	// --- set place of coins  --- //
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

	// --- set place of boosts --- //
	boostx = new Array();
	boostr = new Array();
	boostf = new Array();
	for (var i = 0; i < 5; i++) {
		var lx = i * 1600 + 1000, rx = lx + 1200;
		var px = Math.floor(Math.random() * (rx - lx) + lx);
		var pr = Math.floor(Math.random() * 5);
		boostx.push(px);
		boostr.push(pr);
		boostf.push(true);
	}
}

// --- MOVE ACTION --- //
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
	boost = Math.max(boost - 1 / MOVE_PER_SEC, 0);
	if (dist < GOAL) {
		speed_var += 1 / MOVE_PER_SEC * (boost > 1.0e-7 ? 3 : 1);
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
		get_coins++;
	}
	var colb = collide_boost();
	if (colb != -1) {
		boostf[colb] = false;
		boost = BOOST_TIME;
		get_boosts++;
	}
	score = Math.floor(dist * 4 + get_coins * 50 + get_boosts * 500);
	draw();
}

// --- COLLISION DETECTION --- //
function collide_mob() {
	for (var i = 0; i < mobx.length; i++) {
		var px = dist - mobx[i], py = row - mobr[i] * 80;
		if (mobf[i] && -19.2 < px && px < 19.2 && -48 <= py && py < 48) return i;
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
function collide_boost() {
	for (var i = 0; i < boostx.length; i++) {
		var cx = boostx[i] - 24 / 5, cy = boostr[i] * 80;
		var dx = (dist - 20 <= cx && cx <= dist ? 0 : Math.min(Math.abs(cx - dist), Math.abs(cx - (dist - 20))));
		var dy = (row - 25 <= cy && cy <= row + 25 ? 0 : Math.min(Math.abs(cy - (row - 25)), Math.abs(cy - (row + 25))));
		if (boostf[i] && dx * dx + dy * dy / 25 <= 4.8 * 4.8) return i;
	}
	return -1;
}

// --- RANKING FUNCTIONS --- //
function get_cookie(cname) {
	var name = cname + "=";
	var str = decodeURIComponent(document.cookie).split(';');
	for (var i = 0; i < str.length; i++) {
		while (str[i].length >= 1 && str[i][0] == ' ') str[i] = str[i].substring(1);
		if (str[i].indexOf(name) == 0) return str[i].substring(name.length, str[i].length);
	}
	return "";
}
function get_ranking() {
	var str = get_cookie("data").split(',');
	var ret = new Array();
	for (var i = 0; i < str.length; i++) {
		if (str[i] != "") ret.push(parseInt(str[i]));
	}
	return ret;
}
function set_ranking(x) {
	var res = get_ranking();
	res.push(x);
	res.sort(function (val1, val2) { return val2 - val1; });
	var str = res.join(',');
	var dt = new Date();
	dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000))
	document.cookie = "data=" + encodeURIComponent(res) + "; expires=" + dt.toUTCString();
}

// --- DRAW: START SCREEN --- //
function draw_start() {
	context.drawImage(IMG_STARTPAGE, 0, 0, 750, 500);
	context.fillStyle = "#555555";
	context.fillRect(245, 240, 260, 60);
	context.fillRect(245, 320, 260, 60);
	context.fillRect(245, 400, 260, 60);
	context.fillStyle = "#333333";
	context.font = "normal bold 55px sans-serif";
	context.textAlign = "center";
	context.fillText("Simple Race Car Game", 375, 140);
	context.font = "35px sans-serif";
	context.fillStyle = "#ffffff";
	context.fillText("Play", 375, 284);
	context.fillText("Ranking", 375, 364);
	context.fillText("Quit", 375, 444);
}

// --- DRAW: RESULT SCREEN --- //
function draw_end() {
	context.globalAlpha = 0.3;
	draw();
	context.globalAlpha = 1.0;
	context.fillStyle = "#555555";
	context.fillRect(245, 400, 260, 60);
	context.fillStyle = "#333333";
	context.font = "normal bold 45px sans-serif";
	context.textAlign = "center";
	context.fillText("Results", 375, 100);
	context.font = "normal bold 35px sans-serif";
	context.fillText("Score: " + score, 375, 200);
	context.fillText("Time Bonus: " + time_bonus, 375, 250);
	context.fillText("Total Score: " + (score + time_bonus), 375, 330);
	context.font = "35px sans-serif";
	context.fillStyle = "#ffffff";
	context.fillText("Back", 375, 444);
}

// --- DRAW: RANKING SCREEN --- //
function drawranking() {
	context.drawImage(IMG_STARTPAGE, 0, 0, 750, 500);
	context.fillStyle = "#555555";
	context.fillRect(245, 400, 260, 60);
	context.fillStyle = "#333333";
	context.font = "normal bold 55px sans-serif";
	context.textAlign = "center";
	context.fillText("Ranking", 375, 100);
	context.font = "35px sans-serif";
	var res = get_ranking();
	var suffix = ["st", "nd", "rd", "th", "th"];
	for (var i = 0; i < 5 && i < res.length; i++) {
		context.textAlign = "left";
		context.fillText((i + 1) + suffix[i] + ":", 200, 160 + i * 50);
		context.textAlign = "right";
		context.fillText(res[i], 550, 160 + i * 50);
	}
	context.textAlign = "center";
	context.fillStyle = "#ffffff";
	context.fillText("Back", 375, 444);
}

// --- DRAW: GAME SCREEN --- //
function draw() {
	context.clearRect(0, 0, 750, 500);
	drawroad();
	drawsidebar();
}

// --- DRAW: ROAD MAP --- //
function drawroad() {
	// --- Draw Map --- //
	context.drawImage(IMG_HIGHWAY, 0, 200 - (dist * 5) % 200, 500, 500, 0, 0, 500, 500);
	context.drawImage(IMG_GOAL, 50, dist * 5 - GOAL * 5 + 350, 400, 30);
	context.fillStyle = ""

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

	// --- Draw Coins --- //
	for (var i = 0; i < coinx.length; i++) {
		var px = dist * 5 - coinx[i] * 5 + 380 + 24;
		if (coinf[i] && -48 <= px && px <= 500) {
			context.save();
			context.beginPath();
			context.arc(coinr[i] * 80 + 90, px, 24, Math.PI * 0 / 180, Math.PI * 360 / 180, false);
			context.clip();
			context.drawImage(IMG_COIN, coinr[i] * 80 + 66, px - 24, 48, 48);
			context.restore();
		}
	}

	// --- Draw Boosts --- //
	for (var i = 0; i < boostx.length; i++) {
		var px = dist * 5 - boostx[i] * 5 + 380 + 24;
		if (boostf[i] && -48 <= px && px <= 500) {
			context.save();
			context.beginPath();
			context.arc(boostr[i] * 80 + 90, px, 24, Math.PI * 0 / 180, Math.PI * 360 / 180, false);
			context.clip();
			context.drawImage(IMG_BOOST, boostr[i] * 80 + 66, px - 24, 48, 48);
			context.restore();
		}
	}
}

// --- DRAW: GAME SIDEBAR --- //
function drawsidebar() {
	// --- Basic Setup --- //
	context.strokeStyle = "#ffdd99";
	context.fillStyle = "#ffcccc";
	context.fillRect(500, 0, 250, 500);
	context.strokeRect(500, 0, 250, 140);
	context.strokeRect(500, 140, 250, 150);
	context.strokeRect(500, 290, 250, 100);
	context.strokeRect(500, 390, 250, 110);

	// --- Score --- //
	context.font = "italic bold 50px fantasy";
	context.fillStyle = "#333333";
	context.textAlign = "left";
	context.fillText("SCORE:", 510, 50);
	context.textAlign = "right";
	context.fillText(score, 730, 120);

	// --- Informations --- //
	context.fillStyle = "#333333";
	context.textAlign = "left";
	context.font = "22px sans-serif"
	context.fillText("Time(sec): " + Math.floor(moves / MOVE_PER_SEC * 100) / 100, 510, 175);
	context.fillText("Distance(m): " + Math.min(Math.floor(dist), GOAL), 510, 215);
	context.fillText("Coins: " + get_coins, 510, 255);

	// --- Boost --- //
	context.fillStyle = "#333333";
	context.font = "20px sans-serif";
	context.textAlign = "left";
	context.fillText("Boost Time(sec): " + Math.floor(boost * 100) / 100, 510, 319);
	var grd1 = context.createLinearGradient(520, 0, 730, 0);
	grd1.addColorStop(0, "#44ffff");
	grd1.addColorStop(1, "#4444ff");
	context.fillStyle = grd1;
	context.fillRect(520, 337, 210 * boost / BOOST_TIME, 33);
	context.strokeStyle = "#555555";
	context.strokeRect(520, 337, 210, 33);

	// --- Speed --- //
	context.fillStyle = "#333333";
	context.font = "25px fantasy";
	context.textAlign = "left";
	context.fillText("Speed:  " + Math.round(speed() * 3.6) + "km/h", 510, 420);
	var grd2 = context.createLinearGradient(520, 0, 730, 0);
	grd2.addColorStop(0, "orange");
	grd2.addColorStop(1, "red");
	context.fillStyle = grd2;
	context.fillRect(520, 440, 210 * (speed() * 3.6 / 600), 40);
	context.strokeStyle = "#555555";
	context.strokeRect(520, 440, 210, 40);
}