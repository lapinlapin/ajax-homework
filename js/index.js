var app = APP.github,
    buttonGet = document.getElementsByClassName('button')[0];

buttonGet.addEventListener('click', function(e) {
    e.preventDefault();
    app.getMain(document.getElementsByClassName('text')[0].value);  
}, false);