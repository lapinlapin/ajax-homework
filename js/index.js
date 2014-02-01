var app = APP.github,
	buttonGet = document.getElementsByClassName('button')[0];

buttonGet.onclick = function() {
	var login = document.getElementsByClassName('text')[0];
	app.getMain(login.value);
	return false;
};