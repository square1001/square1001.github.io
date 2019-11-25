// ---- Contest Durations ---- //
const start_time = new Date("2019-11-24T17:00:00+09:00");
const finish_time = new Date("2029-11-24T17:15:00+09:00");

// ---- Top Bar ---- //
var nav_content = "";
nav_content += "<table>";
nav_content += "<tbody>"
nav_content += "<tr>";
nav_content += "<td>";
nav_content += "<img src=\"/gigacode-2019-puzzle/img/gigacode2019-logo.jpg\" style=\"float: left; height: 50px; width: 50px\"></img>";
nav_content += "</td>";
nav_content += "<td>";
nav_content += "<p>GIGACODE 2019 - ALGORITHM PUZZLE</p>";
nav_content += "</td>";
nav_content += "<td style=\"padding-left: 50px\">";
nav_content += "<a href=\"/gigacode-2019-puzzle/index.html\">(メインページへ戻る)</a>"
nav_content += "</td>";
nav_content += "</tr>";
nav_content += "</tbody>";
nav_content += "</table>";
document.getElementById("nav-bar").innerHTML = nav_content;

function fillzero(str, num) {
	// Fill string str with leading zeros.
	while(str.length < num) {
		str = "0" + str;
	}
	return str;
}
function get_time_string(dt) {
	var res = "";
	res += dt.getFullYear();
	res += "/";
	res += dt.getMonth() + 1;
	res += "/";
	res += dt.getDate();
	res += " ";
	res += dt.getHours();
	res += ":";
	res += fillzero(String(dt.getMinutes()), 2);
	res += ":";
	res += fillzero(String(dt.getSeconds()), 2);
	return res;
}
function get_difference_string(dt1, dt2) {
	// dt1 < dt2
	var diff = dt2.getTime() - dt1.getTime();
	var res = "";
	res += Math.floor(diff / 3600000);
	res += ":";
	res += fillzero(String(Math.floor(diff / 60000) % 60), 2);
	res += ":";
	res += fillzero(String(Math.floor(diff / 1000) % 60), 2);
	return res;
}
function clock_update() {
	var clock_content = "";
	var current_time = new Date();
	clock_content += get_time_string(current_time);
	var diff = current_time.getTime() - start_time.getTime();
	var visible_problemset = false;
	var visible_problems = false;
	if(current_time < start_time) {
		clock_content += "  |  コンテスト開始まで残り " + get_difference_string(current_time, start_time);
	}
	else if(current_time < finish_time) {
		clock_content += "  |  コンテスト終了まで残り " + get_difference_string(current_time, finish_time);
		visible_problemset = true;
		visible_problems = true;
	}
	else {
		visible_problemset = true;
	}
	if(window.location.pathname == "/gigacode-2019-puzzle/index.html") {
		if(visible_problemset) {
			document.getElementById("problem-set-table").style.display = "table";
			document.getElementById("problem-set-message").innerHTML = "問題は、以下の 3 問となっております。";
		}
		else {
			document.getElementById("problem-set-table").style.display = "none";
			document.getElementById("problem-set-message").innerHTML = "問題は、コンテスト開始してから公開されます。";
		}
	}
	if(!visible_problems) {
		if(window.location.pathname == "/gigacode-2019-puzzle/problem-1/problem-1.html" || window.location.pathname == "/gigacode-2019-puzzle/problem-2/problem-2.html" || window.location.pathname == "/gigacode-2019-puzzle/problem-3/problem-3.html") {
			if(current_time < start_time) {
				window.alert("コンテストはまだ開始していませんので、まだ解答を提出することはできません。");
			}
			else {
				window.alert("コンテストは終了しました。これ以降、解答を提出することはできません。");
			}
			window.location.href = "/gigacode-2019-puzzle/index.html";
		}
	}
	document.getElementById("clock-div").innerHTML = "<p style=\"color: blue; margin: 0px\">" + clock_content + "</p>";
}
setInterval("clock_update()", 500);
clock_update();

// ---- Others ---- //
const PLAY_LIMIT = 10000; // PLAY LIMIT FOR PROBLEM 2
function get_cookie(cname) {
	var name = cname + "=";
	var str = decodeURIComponent(document.cookie).split(';');
	for (var i = 0; i < str.length; i++) {
		while (str[i].length >= 1 && str[i][0] == ' ') str[i] = str[i].substring(1);
		if (str[i].indexOf(name) == 0) return str[i].substring(name.length, str[i].length);
	}
	return "";
}
function get_highest_score(id) {
	var res = get_cookie("highscore" + String(id));
	if(res == "") return 0;
	return parseInt(res);
}
function get_played_count() {
	var res = get_cookie("playedcnt2");
	if(res == "") return 0;
	return parseInt(res);
}