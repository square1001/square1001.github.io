function is_number(str) {
	if(str == "") return true;
	if(/^\+?(0|[1-9]\d*)$/.test(str)) return true;
	return false;
}

var cvs = document.getElementById("cvs");
var context = cvs.getContext("2d");

const IMG_SRC_ARRAY = [
	"img/sniper-right.png",
	"img/sniper-down.png",
	"img/sniper-left.png",
	"img/sniper-up.png"
];
const IMG_NUMBER = IMG_SRC_ARRAY.length;
var IMG_ARRAY = new Array(IMG_NUMBER);
var IMG_LOADED = 0;
for(var i = 0; i < IMG_NUMBER; ++i) {
	IMG_ARRAY[i] = new Image();
	IMG_ARRAY[i].src = IMG_SRC_ARRAY[i];
	IMG_ARRAY[i].onload = function() {
		++IMG_LOADED;
		/*
		if(IMG_LOADED == IMG_NUMBER) {
			initialize();
		}
		*/
	};
}
var IMG_SNIPER = [
	IMG_ARRAY[0],
	IMG_ARRAY[1],
	IMG_ARRAY[2],
	IMG_ARRAY[3]
];

const lim_iters = 100000;
const dx = [ 0, 1, 0, -1 ];
const dy = [ 1, 0, -1, 0 ];
var limwidth = document.getElementById("editor").clientWidth - 80;
var CH, CW;
var H, W, S;
var cell_size;
var board = [], x = [], y = [], dir = [], spos = [];
function run_program() {
	document.getElementById("error-message").innerHTML = "なし";
	document.getElementById("run-result").style.display = "none";
	H = document.getElementById("number-row").value;
	W = document.getElementById("number-col").value;
	S = document.getElementById("editing-space").value;
	var LS = "";
	for(var i = 0; i < S.length; ++i) {
		if(S[i] != ' ' && S[i] != '\n') {
			LS += S[i];
		}
	}
	S = LS;
	if(!is_number(H) || !is_number(W) || !(1 <= H && H <= 30 && 1 <= W && W <= 30)) {
		document.getElementById("error-message").innerHTML = "H, W が正しい値ではありません";
		document.getElementById("run-result").style.display = "none";
		return;
	}
	var compile_res = compile(S);
	if(compile_res < 0) {
		if(compile_res == -1) {
			document.getElementById("error-message").innerHTML = "正しくない文字が入っています";
		}
		if(compile_res == -2) {
			document.getElementById("error-message").innerHTML = "カッコの対応がおかしいです";
		}
		if(compile_res == -3) {
			document.getElementById("error-message").innerHTML = "プログラムが空です";
		}
		document.getElementById("run-result").style.display = "none";
		return;
	}
	if(compile_res == 1) {
		document.getElementById("error-message").innerHTML = "計算回数 100,000 に達しました";
	}
	cell_size = Math.min(30, limwidth / Math.max(H, W));
	CH = cell_size * H + 40;
	CW = cell_size * W + 40;
	cvs.height = CH;
	cvs.width = CW;
	document.getElementById("num-iters-input").min = 0;
	document.getElementById("num-iters-input").max = board.length - 1;
	document.getElementById("num-iters-input").step = 1;
	document.getElementById("num-iters-input").value = 0;
	document.getElementById("num-iters-print").min = 0;
	document.getElementById("num-iters-print").max = board.length - 1;
	document.getElementById("num-iters-print").value = 0;
	document.getElementById("viewing-speed-input").value = 0;
	change_numiters();
	change_viewspeed();
	draw(0);
	document.getElementById("run-result").style.display = "block";
}
function compile(str) {
	if(str == "") return -3;
	for(var i = 0; i < str.length; ++i) {
		if("FLR!()[] \n".indexOf(str[i]) == -1) {
			return -1;
		}
	}
	var st = [];
	for(var i = 0; i < str.length; ++i) {
		if(str[i] == 'F' || str[i] == 'L' || str[i] == 'R' || str[i] == '!') {
			// do nothing
		}
		else if(str[i] == '(') {
			st.push(0);
		}
		else if(str[i] == '[') {
			st.push(1);
		}
		else if(str[i] == ')') {
			if(st.length == 0 || st[st.length - 1] != 0) return -2;
			st.pop();
		}
		else if(str[i] == ']') {
			if(st.length == 0 || st[st.length - 1] != 1) return -2;
			st.pop();
		}
	}
	if(st.length != 0) return -2;
	var par = [];
	for(var i = 0; i < str.length; ++i) {
		par.push(-1);
		if(str[i] == '(' || str[i] == '[') {
			st.push(i);
		}
		if(str[i] == ')' || str[i] == ']') {
			par[st[st.length - 1]] = i;
			par[i] = st[st.length - 1];
			st.pop();
		}
	}
	board.splice(0, board.length);
	x.splice(0, x.length);
	y.splice(0, y.length);
	dir.splice(0, dir.length);
	spos.splice(0, spos.length);
	board.push(Array());
	for(var i = 0; i < H; ++i) {
		board[0].push(0);
	}
	x.push(0);
	y.push(0);
	dir.push(0);
	spos.push(0);
	for(var i = 0; i < lim_iters; ++i) {
		if(spos[i] == str.length) break;
		var curc = S[spos[i]];
		if(curc == 'F') {
			var nx = x[i] + dx[dir[i]], ny = y[i] + dy[dir[i]];
			if(nx >= H) nx = H - 1;
			if(nx < 0) nx = 0;
			if(ny >= W) ny = W - 1;
			if(ny < 0) ny = 0;
			board.push(board[i].slice());
			x.push(nx);
			y.push(ny);
			dir.push(dir[i]);
			spos.push(spos[i] + 1);
		}
		if(curc == 'L') {
			board.push(board[i].slice());
			x.push(x[i]);
			y.push(y[i]);
			dir.push((dir[i] + 3) % 4);
			spos.push(spos[i] + 1);
		}
		if(curc == 'R') {
			board.push(board[i].slice());
			x.push(x[i]);
			y.push(y[i]);
			dir.push((dir[i] + 1) % 4);
			spos.push(spos[i] + 1);
		}
		if(curc == '!') {
			var nb = board[i].slice();
			nb[x[i]] ^= (1 << y[i]);
			board.push(nb);
			x.push(x[i]);
			y.push(y[i]);
			dir.push(dir[i]);
			spos.push(spos[i] + 1);
		}
		if(curc == '(' || curc == '[') {
			var flag = true;
			if(curc == '(' && (board[i][x[i]] & (1 << y[i])) != 0) {
				flag = false;
			}
			if(curc == '[') {
				var nx = x[i] + dx[dir[i]], ny = y[i] + dy[dir[i]];
				if(nx < 0 || H <= nx || ny < 0 || W <= ny) {
					flag = false;
				}
			}
			board.push(board[i].slice());
			x.push(x[i]);
			y.push(y[i]);
			dir.push(dir[i]);
			if(flag) {
				spos.push(spos[i] + 1);
			}
			else {
				spos.push(par[spos[i]] + 1);
			}
		}
		if(curc == ')' || curc == ']') {
			var flag = true;
			if(curc == '(' && (board[i][x[i]] & (1 << y[i])) != 0) {
				flag = false;
			}
			if(curc == '[') {
				var nx = x[i] + dx[dir[i]], ny = y[i] + dy[dir[i]];
				if(nx < 0 || H <= nx || ny < 0 || W <= ny) {
					flag = false;
				}
			}
			board.push(board[i].slice());
			x.push(x[i]);
			y.push(y[i]);
			dir.push(dir[i]);
			if(flag) {
				spos.push(par[spos[i]]);
			}
			else {
				spos.push(spos[i] + 1);
			}
		}
	}
	if(board.length == lim_iters + 1 && spos[lim_iters] != str.length) {
		return 1;
	}
	return 0;
}
function draw(pos) {
	if(spos[pos] == S.length) {
		document.getElementById("result-program").innerHTML = S;
	}
	else {
		var content = "";
		content += S.substr(0, spos[pos]);
		content += "<span style=\"color: red\">" + S.substr(spos[pos], 1) + "</span>";
		content += S.substr(spos[pos] + 1, S.length - spos[pos] - 1);
		document.getElementById("result-program").innerHTML = content;
	}
	context.clearRect(0, 0, CW, CH);
	context.fillStyle = "#080808";
	context.fillRect(0, 0, CW, CH);
	context.fillStyle = "#FFFFFF";
	context.fillRect(20, 20, CW - 40, CH - 40);
	context.strokeStyle = "#191919";
	for(var i = 0; i < H; ++i) {
		for(var j = 0; j < W; ++j) {
			context.strokeRect(20 + cell_size * j, 20 + cell_size * i, cell_size, cell_size);
			if((board[pos][i] & (1 << j)) != 0) {
				context.fillStyle = "#111111";
			}
			else {
				context.fillStyle = "#FFFFFF";
			}
			context.fillRect(20 + cell_size * j + 1, 20 + cell_size * i + 1, cell_size - 2, cell_size - 2);
		}
	}
	context.drawImage(IMG_SNIPER[dir[pos]], 20 + cell_size * y[pos], 20 + cell_size * x[pos], cell_size, cell_size);
	return 0;
}