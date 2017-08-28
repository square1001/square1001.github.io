var cvs = document.getElementById("cvs");
var context = cvs.getContext("2d");
var pos, pme, a, tm, curload = 0, isstarted = 0;
var twitter_img = new Image(); twitter_img.src = "img/twitter.png";
var restart_img = new Image(); restart_img.src = "img/restart.png";
twitter_img.onload = restart_img.onload = function () {
	curload++;
	if (curload == 2) start();
}
window.onkeydown = function (event) {
	if (isstarted == 0 && event.keyCode == 32) {
		isstarted = -1;
		init();
	}
	if (isstarted == 1) {
		if (event.keyCode == 37 && pme >= 1) pme--, draw();
		if (event.keyCode == 39 && pme <= 18) pme++, draw();
		if (iscollide()) setTimeout("finish()", 50);
	}
}
window.onmousedown = function (event) {
	var sx = event.pageX - cvs.offsetLeft;
	var sy = event.pageY - cvs.offsetTop;
	if (isstarted == 2) {
		if ((sx - 150) * (sx - 150) + (sy - 370) * (sy - 370) <= 2500) {
			window.open("https://twitter.com/intent/tweet?text=I%20got%20score%20" + pos + "%20on%20Falling%20Game%20by%20square1001!%0Ahttps://square1001.github.io/joiss2017/falling-game.html%0A%23joissfallinggame");
		}
		if ((sx - 350) * (sx - 350) + (sy - 370) * (sy - 370) <= 2500) {
			start();
		}
	}
}
function start() {
	isstarted = 0;
	context.fillStyle = "#ccffff";
	context.fillRect(0, 0, 500, 500);
	context.fillStyle = "black";
	context.textAlign = "center";
	context.font = "25px sans-serif";
	context.fillText("Press Space-key to Start", 250, 240);
}
function init() {
	pos = 0; pme = 10;
	a = new Array(1020);
	for (var i = 0; i < 1020; i++) a[i] = Math.floor(Math.random() * 20);
	tm = setInterval("move()", 200);
	isstarted = 1;
}
function move() {
	a[pos] = Math.floor(Math.random() * 20);
	pos++;
	draw();
	if (pos % 50 == 0) {
		clearInterval(tm);
		tm = setInterval("move()", 800 / (Math.floor(pos / 50) + 4));
	}
	if (iscollide()) setTimeout("finish()", 50);
}
function draw() {
	context.fillStyle = "#ccffff";
	context.fillRect(0, 0, 500, 500);
	for (var i = 0; i < 1000; i++) {
		var cv = (pos < 20 ? i - pos + 20 : (i - (pos - 20) % 1000 + 1000) % 1000);
		if (0 <= cv && cv < 20) {
			context.fillStyle = "#9999ff";
			var cx = a[i] * 25, cy = (19 - cv) * 25;
			context.fillRect(cx + 1, cy + 1, 23, 23);
		}
	}
	context.fillStyle = "#ffff77";
	context.fillRect(pme * 25, 19 * 25, 25, 25);
	context.fillStyle = "black";
	context.textAlign = "start";
	context.font = "normal bold 22px monospace";
	context.fillText("Current Score: " + pos, 10, 27);
}
function iscollide() {
	if (pos >= 20 && a[(pos - 20) % 1000] == pme) return true;
	return false;
}
function finish() {
	isstarted = 2;
	clearInterval(tm);
	context.fillStyle = "#ccffff";
	context.fillRect(0, 0, 500, 500);
	context.fillStyle = "black";
	context.textAlign = "center";
	context.font = "35px sans-serif";
	context.fillText("GAME OVER", 250, 90);
	context.fillText("Score: " + pos, 250, 200);
	context.save();
	context.beginPath();
	context.arc(150, 370, 50, Math.PI / 180 * 0, Math.PI / 180 * 360, false);
	context.closePath();
	context.clip();
	context.drawImage(twitter_img, 100, 320, 100, 100);
	context.restore();
	context.save();
	context.beginPath();
	context.arc(350, 370, 50, Math.PI / 180 * 0, Math.PI / 180 * 360);
	context.clip();
	context.drawImage(restart_img, 300, 320, 100, 100);
	context.restore();
}