var cvs = document.getElementById("cvs");
var context = cvs.getContext("2d");
var H, W, d, a, curload = 0, selected = 0, isediting = false;
var img = new Array(4);
for(var i = 0; i < 4; i++) {
	img[i] = new Image();
	img[i].onload = function() {
		curload++;
		if(curload == 4) {
			start();
		}
	}
}
img[0].src = "img/whitecell.png";
img[1].src = "img/blackcell.png";
img[2].src = "img/startcell.png";
img[3].src = "img/goalcell.png";
function start() {
	H = document.getElementById("row").value;
	W = document.getElementById("col").value;
	d = Math.ceil(1400 / (20 + Math.max(H, W)));
	a = Array(H);
	for (var i = 0; i < H; i++) {
		a[i] = Array(W);
		for (var j = 0; j < W; j++) a[i][j] = 0;
	}
	cvs.height = Math.max(d * H + 10, 221);
	cvs.width = d * W + 70;
	draw();
	isediting = true;
}
window.onmousedown = function (event) {
	var px = event.pageX - cvs.offsetLeft;
	var py = event.pageY - cvs.offsetTop;
	if (isediting) {
		if (0 <= px - 5 && px - 5 < d * W && 0 <= py - 5 && py - 5 <= d * H) {
			a[Math.floor((py - 5) / d)][Math.floor((px - 5) / d)] = selected;
			draw();
		}
		for (var i = 0; i < 4; i++) {
			if (W * d + 17 <= px && px < W * d + 63 && i * 55 + 5 <= py && py < i * 55 + 53) {
				selected = i;
				draw();
			}
		}
	}
}
function solve() {
	var nums = 0, numg = 0;
	for (var i = 0; i < H; i++) {
		for (var j = 0; j < W; j++) {
			if (a[i][j] == 2) nums++;
			if (a[i][j] == 3) numg++;
		}
	}
	document.getElementById("warn_start").innerHTML = (nums != 1 ? "There must be exactly one start point" : "");
	document.getElementById("warn_goal").innerHTML = (numg != 1 ? "There must be exactly one goal point" : "");
	document.getElementById("warn_nosol").innerHTML = "";
	if (nums == 1 && numg == 1) {
		var dist = new Array(H * W), sx = -1, sy = -1, gx = -1, gy = -1;
		for (var i = 0; i < H; i++) {
			for (var j = 0; j < W; j++) {
				dist[i * W + j] = -1;
				if (a[i][j] == 2) sx = i, sy = j;
				if (a[i][j] == 3) gx = i, gy = j;
			}
		}
		var que = new Array(); que.push(sx * H + sy); dist[sx * W + sy] = 0;
		var dx = [0, 1, 0, -1];
		var dy = [1, 0, -1, 0];
		while (que.length >= 1) {
			var u = que.shift();
			for (var i = 0; i < 4; i++) {
				var tx = Math.floor(u / W) + dx[i], ty = u % W + dy[i];
				if (0 <= tx && tx < H && 0 <= ty && ty < W && a[tx][ty] != 1 && dist[tx * W + ty] == -1) {
					dist[tx * W + ty] = dist[u] + 1;
					que.push(tx * W + ty);
				}
			}
		}
		if (dist[gx * W + gy] == -1) {
			document.getElementById("warn_nosol").innerHTML = "There are no path between start and goal";
		}
		else {
			context.strokeStyle = "red";
			context.lineWidth = d / 8;
			context.beginPath();
			var pos = gx * W + gy;
			context.moveTo(pos % W * d + d / 2 + 5, Math.floor(pos / W) * d + d / 2 + 5);
			for (var i = dist[gx * W + gy] - 1; i >= 0; i--) {
				for (var j = 0; j < 4; j++) {
					var tx = Math.floor(pos / W) + dx[j], ty = pos % W + dy[j];
					if (0 <= tx && tx < H && 0 <= ty && ty < W && dist[tx * W + ty] == i) {
						context.lineTo(ty * d + d / 2 + 5, tx * d + d / 2 + 5);
						pos = tx * W + ty;
						break;
					}
				}
			}
			context.stroke();
		}
	}
}
function draw() {
	context.clearRect(0, 0, cvs.width, cvs.height);
	for (var i = 0; i < H; i++) {
		for (var j = 0; j < W; j++) {
			context.drawImage(img[a[i][j]], j * d + 5, i * d + 5, d, d);
		}
	}
	for (var i = 0; i < 4; i++) {
		if (selected == i) {
			context.fillStyle = "#ffff77";
			context.fillRect(W * d + 15, i * 55 + 3, 52, 52);
		}
		context.drawImage(img[i], W * d + 17, i * 55 + 5, 48, 48);
	}
}