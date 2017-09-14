var opened = false;
function change_open() {
	var bar = document.getElementById("rule-explanation");
	if (opened == false) {
		opened = true;
		bar.style.display = "block";
	}
	else {
		opened = false;
		bar.style.display = "none";
	}
}