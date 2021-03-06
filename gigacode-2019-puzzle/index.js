document.getElementById("highscore-1").innerHTML = get_highest_score(1);
document.getElementById("highscore-2").innerHTML = get_highest_score(2);
document.getElementById("highscore-3").innerHTML = get_highest_score(3);
document.getElementById("remain-plays").innerHTML = PLAY_LIMIT - get_played_count();
var sum = get_highest_score(1) + get_highest_score(2) + get_highest_score(3);
document.getElementById("total-score").innerHTML = sum;
var tweet_text = "";
tweet_text += "GigaCode 2019「アルゴリズム・パズル」結果" + "%0A";
tweet_text += "問題 1「銃士の迷路」：" + get_highest_score(1) + " 点" + "%0A";
tweet_text += "問題 2「ギガコード君を探せ！」：" + get_highest_score(2) + " 点" + "%0A";
tweet_text += "問題 3「給料日」：" + get_highest_score(3) + " 点" + "%0A";
tweet_text += "合計点は、" + sum + " 点でした！" + "%0A";
tweet_text += "https://square1001.github.io/gigacode-2019-puzzle/index.html" + "%0A";
tweet_text += "%23GigaCode2019";
var tweet_link = "";
tweet_link += "https://twitter.com/intent/tweet?text=";
tweet_link += tweet_text;
document.getElementById("tweet-link").href = tweet_link;
function reset_results() {
	var dt = new Date();
	dt.setTime(dt.getTime() - 1000);
	document.cookie = "highscore1=" + "; expires=" + dt.toUTCString() + "; path=/";
	document.cookie = "highscore2=" + "; expires=" + dt.toUTCString() + "; path=/";
	document.cookie = "highscore3=" + "; expires=" + dt.toUTCString() + "; path=/";
	document.cookie = "playedcnt2=" + "; expires=" + dt.toUTCString() + "; path=/";
	location.reload();
}