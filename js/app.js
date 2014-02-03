({
    checkCash: function() {
        var dateNow = new Date(),
            s = dateNow.getDay()+''+dateNow.getDate()+''+dateNow.getFullYear(); //переменная, для читабельности
            
        for (var i = localStorage.length - 1; i > -1; i--) {
    	    if (localStorage.key(i).indexOf('gitLoader:') !== -1 && localStorage.key(i).indexOf(s) === -1 ) {
    	        localStorage.removeItem(localStorage.key(i));
            }
        }
    }   
}).checkCash();

var APP = {}; 

APP.cache = (function() {
    var dateNow = new Date(), 
        s = dateNow.getDay()+''+dateNow.getDate()+''+dateNow.getFullYear(); 
	
    function cashing(login, dataObj) {
        localStorage[login + '[gitLoader:'+s+']'] = JSON.stringify(dataObj);
    }

    function readCash(login) {
        var render = APP.templator.render; 

        if (localStorage[login + '[gitLoader:'+s+']']) { 
            render(JSON.parse(localStorage[login + '[gitLoader:'+s+']'])); 
            return true; 
        } 

        return false;
    }

    return { 
        cashing: cashing, 
        readCash: readCash
    }
})()

APP.templator = (function() {
    function render(view) { 
        var wrap = document.createElement('div'); 

        wrap.innerHTML = Mustache.render(document.getElementById('template').innerHTML, view);
        document.body.appendChild(wrap); 
    }
    return { 
        render: render 
    }
})()

APP.github = (function() {
    var results = {  
        login: '',
        email: '',
        followers: '',
        repos_url: ''
    };

    function checkExistLogin() { 
        var message = document.getElementsByClassName('message')[0],
            style = message.style;

        style.display = 'block';
								
        setTimeout(function() {
            style.display = 'none';
        }, 2000);
    }

    function clearResults(obj) {  
        Object.keys(obj).
            forEach(function(elem) {
                obj[elem] = ''; 
            });
    }

    function checkData(obj, results) {
        Object.keys(results).
            forEach(function(elem) {
                if (obj[elem]) {
                results[elem] = obj[elem];
            }
        });
        obj = undefined;
    }

    function getMain(login) {	
        var readCash = APP.cache.readCash;
     
        if (readCash(login)) {  
            return false; 
        };
	    
        var xhr = new XMLHttpRequest(), 
            jsonGetData;

        xhr.open('GET', 'https://api.github.com/users/'+login); 

        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return; 

            jsonGetData = JSON.parse(xhr.responseText); 
			
            if (!jsonGetData.login) {   
                checkExistLogin();  
                return false;  
            }

            clearResults(results); 
            checkData(jsonGetData, results);
            getRepos(login); 
        }
        xhr.send();
    }
    
    function getRepos(login) {
        var xhr = new XMLHttpRequest(),
            reposData, 
            render = APP.templator.render, 
            caching = APP.cache.cashing;

        xhr.open('GET', 'https://api.github.com/users/'+login+'/repos'); 

        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return; 
 
            reposData = JSON.parse(xhr.responseText);
            results.repos_url = ''; 
		    
            reposData.forEach(function(elem) { 
                if (elem['name']) {    
                    results.repos_url += (elem['name'])+'. '; 
                }
            });

            caching(login, results); 
            render(results);  
        }
        xhr.send();	
    }
    return {  
        getMain: getMain,
        results: results
    }
})()
