var cvs = document.getElementById("cvs");
var context = cvs.getContext("2d");
var pos, pme, a, tm, isstarted = 0;
context.fillStyle = "#ccffff";
context.fillRect(0, 0, 500, 500);
context.fillStyle = "black";
context.textAlign = "center";
context.font = "25px sans-serif";
context.fillText("Press Space-key to Start", 250, 240);
document.onkeydown = function (event) {
	if (isstarted == 0 && event.keyCode == 32) {
		isstarted = -1;
		init();
	}
	if (isstarted == 1) {
		if (event.keyCode == 37&& pme >= 1) pme--;
		if (event.keyCode == 39 && pme <= 18) pme++;
		if (iscollide()) setTimeout("finish()", 50);
	}
}
function init() {
	pos = 0; pme = 10;
	a = new Array(1020);
	for (var i = 0; i < 1020; i++) a[i] = Math.floor(Math.random() * 20);
	tm = setInterval("draw()", 200);
	isstarted = 1;
}
function finish() {
	isstarted = 2;
	clearInterval(tm);
	context.fillStyle = "#ccffff";
	context.fillRect(0, 0, 500, 500);
	context.fillStyle = "black";
	context.textAlign = "center";
	context.font = "25px sans-serif";
	context.fillText("GAME OVER", 250, 200);
	context.fillText("Score: " + pos, 250, 240);
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
	a[pos] = Math.floor(Math.random() * 20);
	pos++;
	if (pos % 50 == 0) {
		clearInterval(tm);
		tm = setInterval("draw()", 800 / (Math.floor(pos / 50) + 4));
	}
	if (iscollide()) setTimeout("finish()", 50);
}
function iscollide() {
	if (pos >= 21 && a[(pos - 21) % 1000] == pme) return true;
	return false;
}