var cvs = document.getElementById("cvs");
var context = cvs.getContext("2d");
var img_base = new Image();
img_base.src = "picture-base.png";

var mode_id = -1;
var question_id = -1;
var score = 0;
var picture_label_1 = new Array(10);
var picture_label_2 = new Array(10);
var picture_id_1 = new Array(10);
var picture_id_2 = new Array(10);

var label_choice = [ "airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck" ]

function start_quiz() {
	var select_mode = document.getElementsByName("select-mode");
	for(var i = 0; i < 7; ++i) {
		if(select_mode[i].checked) {
			mode_id = i + 1;
		}
	}
	while(true) {
		for(var i = 0; i < 10; i++) {
			while(true) {
				picture_label_1[i] = Math.floor(Math.random() * 10);
				picture_label_2[i] = Math.floor(Math.random() * 10);
				if(picture_label_1[i] != picture_label_2[i]) {
					break;
				}
			}
			picture_id_1[i] = Math.floor(Math.random() * 100);
			picture_id_2[i] = Math.floor(Math.random() * 100);
		}
		var can_exit = true;
		for(var i = 0; i < 10; i++) {
			for(var j = 0; j < i; j++) {
				var id1 = picture_label_1[i] * 100 + picture_id_1[i];
				var id2 = picture_label_2[i] * 100 + picture_id_2[i];
				var id3 = picture_label_1[j] * 100 + picture_id_1[j];
				var id4 = picture_label_2[j] * 100 + picture_id_2[j];
				if(id1 == id3 || id1 == id4 || id2 == id3 || id2 == id4) {
					can_exit = false;
				}
			}
		}
		if(can_exit) {
			break;
		}
	}
	question_id = 0;
	score = 0;
	document.getElementById("quiz").style.display = "block";
	for(var i = 0; i < (mode_id == 1 ? 1 : 2); i++) {
		var choice_str = ""
		for(var j = 0; j < 10; j++) {
			choice_str += "<input type=\"radio\" id=\"choice-";
			choice_str += label_choice[j];
			choice_str += "\" name=\"select-choice-" + (i + 1) + "\" value=";
			choice_str += j;
			choice_str += "\">";
			choice_str += "<label for=\"choice-";
			choice_str += label_choice[j]
			choice_str += "\">";
			choice_str += label_choice[j];
			choice_str += "</label>"
		}
		document.getElementById("label-choice-" + (i + 1)).innerHTML = choice_str;
	}
	if(mode_id == 1) {
		document.getElementById("label-choice-2").innerHTML = "";
	}
	draw_picture();
	update_score();
}
function draw_picture() {
	if(mode_id == 1) {
		context.drawImage(img_base, picture_id_1[question_id] * 32, picture_label_1[question_id] * 32, 32, 32, 0, 0, 320, 320);
	}
	else if(2 <= mode_id && mode_id <= 6) {
		var sep = (1 << (mode_id - 1));
		var picture_flag = new Array(sep * sep);
		for(var i = 0; i < sep * sep; i++) {
			picture_flag[i] = false;
		}
		for(var i = 0; 2 * i < sep * sep; i++) {
			var u = -1;
			while(u == -1 || picture_flag[u] == true) {
				u = Math.floor(Math.random() * (sep * sep));
			}
			picture_flag[u] = true;
		}
		for(var i = 0; i < sep; i++) {
			for(var j = 0; j < sep; j++) {
				if(picture_flag[i * sep + j] == false) {
					context.drawImage(img_base, picture_id_1[question_id] * 32 + j * 32 / sep, picture_label_1[question_id] * 32 + i * 32 / sep, 32 / sep, 32 / sep, j * 320 / sep, i * 320 / sep, 320 / sep, 320 / sep);
				}
				else {
					context.drawImage(img_base, picture_id_2[question_id] * 32 + j * 32 / sep, picture_label_2[question_id] * 32 + i * 32 / sep, 32 / sep, 32 / sep, j * 320 / sep, i * 320 / sep, 320 / sep, 320 / sep);
				}
			}
		}
	}
	else if(mode_id == 7) {
		var pixel_array_r = new Array(32 * 32);
		var pixel_array_g = new Array(32 * 32);
		var pixel_array_b = new Array(32 * 32);
		for(var i = 0; i < 32 * 32; i++) {
			pixel_array_r[i] = 0;
			pixel_array_g[i] = 0;
			pixel_array_b[i] = 0;
		}
		context.drawImage(img_base, picture_id_1[question_id] * 32, picture_label_1[question_id] * 32, 32, 32, 0, 0, 32, 32);
		for(var i = 0; i < 32; i++) {
			for(var j = 0; j < 32; j++) {
				var pixel_p = context.getImageData(j, i, 1, 1).data;
				pixel_array_r[i * 32 + j] += pixel_p[0];
				pixel_array_g[i * 32 + j] += pixel_p[1];
				pixel_array_b[i * 32 + j] += pixel_p[2];
			}
		}
		context.drawImage(img_base, picture_id_2[question_id] * 32, picture_label_2[question_id] * 32, 32, 32, 0, 0, 32, 32);
		for(var i = 0; i < 32; i++) {
			for(var j = 0; j < 32; j++) {
				var pixel_p = context.getImageData(j, i, 1, 1).data;
				pixel_array_r[i * 32 + j] += pixel_p[0];
				pixel_array_g[i * 32 + j] += pixel_p[1];
				pixel_array_b[i * 32 + j] += pixel_p[2];
			}
		}
		for(var i = 0; i < 32; i++) {
			for(var j = 0; j < 32; j++) {
				context.fillStyle = `rgb(${pixel_array_r[i * 32 + j] / 2}, ${pixel_array_g[i * 32 + j] / 2}, ${pixel_array_b[i * 32 + j] / 2})`;
				context.fillRect(j * 320 / 32, i * 320 / 32, 320 / 32, 320 / 32);
			}
		}
	}
}
function update_score() {
	if(question_id == -1) {
		document.getElementById("scoreboard").innerHTML = "Final Score: " + score + " / 100";
		document.getElementById("scoreboard").style = "color: green";
	}
	else {
		document.getElementById("scoreboard").innerHTML = "Score: " + score + " / " + (question_id * 10);
		document.getElementById("scoreboard").style = "";
	}
}
function answer_quiz() {
	if(question_id == -1) {
		return;
	}
	var select_choice_1 = document.getElementsByName("select-choice-1");
	var select_choice_2;
	var response_1 = -1;
	for(var i = 0; i < 10; i++) {
		if(select_choice_1[i].checked) {
			response_1 = i;
		}
	}
	var response_2 = -1;
	if(mode_id != 1) {
		select_choice_2 = document.getElementsByName("select-choice-2");
		for(var i = 0; i < 10; i++) {
			if(select_choice_2[i].checked) {
				response_2 = i;
			}
		}
	}
	if(response_1 == -1 || (mode_id != 1 && response_2 == -1)) {
		document.getElementById("message").innerHTML = "Please choose one/two of the choices.";
		document.getElementById("message").style = "color: red";
	}
	else if(mode_id != -1 && response_1 == response_2) {
		document.getElementById("message").innerHTML = "Please choose two DIFFERENT choices.";
		document.getElementById("message").style = "color: red";
	}
	else {
		document.getElementById("message").innerHTML = "Message: None";
		document.getElementById("message").style = "";
		if(mode_id == 1) {
			if(response_1 == picture_label_1[question_id]) {
				score += 10;
			}
		}
		else {
			var correct_1 = picture_label_1[question_id];
			var correct_2 = picture_label_2[question_id];
			var num_corrects = 0;
			if(response_1 == correct_1) {
				num_corrects++;
			}
			if(response_1 == correct_2) {
				num_corrects++;
			}
			if(response_2 == correct_1) {
				num_corrects++;
			}
			if(response_2 == correct_2) {
				num_corrects++;
			}
			if(num_corrects == 2) {
				score += 10;
			}
			else if(num_corrects == 1) {
				score += 3;
			}
		}
		select_choice_1[response_1].checked = false;
		if(mode_id != 1) {
			select_choice_2[response_2].checked = false;
		}
		if(question_id != 9) {
			question_id++;
			document.getElementById("scoreboard").innerHTML = "Score: " + score + " / " + (question_id * 10);
			draw_picture();
		}
		else {
			question_id = -1;
			document.getElementById("scoreboard").innerHTML = "Final Score: " + score + " / 100";
			document.getElementById("scoreboard").style = "color: green";
		}
	}
}
