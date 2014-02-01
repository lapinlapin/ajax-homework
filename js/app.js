var APP = {}; 
APP.cache = {};
APP.templator = {};
APP.github = {};

// КЕШ
APP.cache = (function() {
	var dateNow = new Date(), 
	 	s = dateNow.getDay()+''+dateNow.getDate()+''+dateNow.getFullYear(); //записываем дату в формате
	
	// кешируем
	function cashing(login, dataObj) {
		localStorage[login + '['+s+']'] = JSON.stringify(dataObj); //ключ логин+дата
	}

	//проверяем
	function readCash(login) {
		var i,
			getData, // если найдем, сюда запишем
			render = APP.templator.render; // зависимость

		for (i = 0; i < localStorage.length; i++) {
			if (localStorage.key(i) === login + '['+s+']') { // нашли ключ
				getData = JSON.parse(localStorage.getItem(localStorage.key(i))); // парсим данные по ключу
				render('template', getData); // шаблонизируем
				return true; // возвращаем тру
			} 
		}
		return false; // если не нашли 
	}
	return {  // открываем
		cashing: cashing, 
		readCash: readCash
	}
})()

// ШАБЛОН
APP.templator = (function() {
	function render(template, view) { // принимаем шаблон и объект
		var output,
			parent = document.body, //папка
			wrap = document.createElement('div'); // обертка

	 	template = document.getElementById('template').innerHTML; // забирам шаблон
		output = Mustache.render(template, view); // рендерим
		wrap.innerHTML = output // кидаем в обертку
		parent.appendChild(wrap); // добавляем в дом
	}
	return {  // открываем
		render: render 
	}
})()

// запросы
APP.github = (function() {
	var results = {     // конечный готовый объект с необходимыми свойствами
		login: '',
		email: '',
		followers: '',
		repos_url: ''
	};

	function checkExistLogin() {  // вызовем эту функцию если не найдем логин
		var message = document.getElementsByClassName('message')[0],
			style = message.style;
		style.display = 'block';
								// появится предупреждение и потухнет
		setTimeout(function() {
			style.display = 'none';
		}, 2000);
	}

	function clearResults(obj) {  // принимаем объект, чистим от предыдущих данных
					//т.к почта не у всех бывает, и если у первого человека она будет
					//а потом сразу на втором запросе у второго не будет, останется почта предыдущего
		Object.keys(obj).forEach(function(elem) {
			obj[elem] = ''; // поэтому чистим ;))
		});
	}

	function checkData(obj) { // принимаем объект
		var login = 'login',   // записываем в переменные значения НУЖНЫХ СВОЙСТВ
			email = 'email',   // из объекта, который прилетает с сервера
			follow = 'followers',
			repos = 'repos_url';

		if (obj[login]) {    // теперь проверяем объект с ответом на нужные свойства
			results[login] = obj[login];   // и записываем в другой объект только нужное
		}
		if (obj[email]) {
			results[email] = obj[email];
		}
		if (obj[follow]) {
			results[follow] = obj[follow];
		}
		if (obj[repos]) {
			results[repos] = obj[repos];
		}		
		obj = undefined;   // исходный нам не нужен, поэтому и данные его не нужны все

		return results; 
	}

	// запрос 1
	function getMain(login) {		// принимаем логин
		var readCash = APP.cache.readCash; // зависимость на чтение кеша
		if (readCash(login)) {  //если возвратит тру, заберем из кеша, добавим в дом
			return false;   // и прикратим все ниже
		};
	       // ИНАЧЕ
 		var xhr = new XMLHttpRequest(), 
 			jsonGetData;  // сюда прилетят данные

		xhr.open('GET', 'https://api.github.com/users/'+login, true);  // урл + логин

		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4) return;   // если все ок

		    jsonGetData = xhr.responseText;		     // получаем  json
		    jsonGetData = JSON.parse(jsonGetData);   // парсим в объект
			
	  		if (!jsonGetData.login) {   // чекаем свойство на логин, если логина такого нет
		    	checkExistLogin();  // вызываем функцию с предупреждением
		    	return false;  
		    }

		    clearResults(results); // очищаем результаты от предыдущего запроса
		    checkData(jsonGetData); // проверяем объект и пишем нужные свойства в другой объект

		    getRepos(login); // вызываем ЗАПРОС 2 
		}
		xhr.send(null);
	}

	// ЗАПРОС 2  (сразу одним забрать не получилось, т.к репозитории в отдельной линке)
	function getRepos(login) {
 		var xhr = new XMLHttpRequest(),
 			reposData,  // для данных
 			render = APP.templator.render, //зависимости
 			caching = APP.cache.cashing;

		xhr.open('GET', 'https://api.github.com/users/'+login+'/repos', true); //другой урл

		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4) return; 

		    reposData = xhr.responseText;  // получаем репозитории
		    reposData = JSON.parse(reposData);  // парсим в объект

		    results.repos_url = ''; // в нашем объекте это свойство еще пустое, т.к 1 запрос не мог сюда прокинуть
		    
		    reposData.forEach(function(elem) { // данные там в таком виде [ {} , {} , {} ]
		    	if (elem['name']) {    //нас интересуют только названия репозиториев, это свойство NAME
		    		results.repos_url += (elem['name'])+'. '; // поочереди добавляем в строку все названия
		    	}
		    });

		    caching(login, results); // кешируем
		    render('template', results);  // и когда теперь объект results собран, рендерим
		}
		xhr.send(null);		
	}
	return {   //открываем
		getMain: getMain,
		results: results
	}

})()
