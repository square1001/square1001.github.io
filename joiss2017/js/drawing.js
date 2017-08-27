var cvs = document.getElementById("cvs");
context = cvs.getContext("2d");
context.fillStyle = "#eeeeee";
window.onkeydown = function (event) {
	if (event.keyCode == 49) context.fillStyle = "#eeeeee";
	if (event.keyCode == 50) context.fillStyle = "#ccffff";
	if (event.keyCode == 51) context.fillStyle = "#ffccff";
	if (event.keyCode == 52) context.fillStyle = "#ffffcc";
	if (event.keyCode == 53) context.fillStyle = "#ffffff";
}
window.onmousedown = function (event) {
	var cur = document.getElementById("cvs");
	var cx = event.pageX - cur.offsetLeft;
	var cy = event.pageY - cur.offsetTop;
	var fixedcx = Math.floor(cx / 25) * 25;
	var fixedcy = Math.floor(cy / 25) * 25;
	context.fillRect(fixedcx + 1, fixedcy + 1, 23, 23);
}