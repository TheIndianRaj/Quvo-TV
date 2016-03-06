var express = require('express');
// var bodyParser = require('body-parser');
var app = express();
var PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

var path = require ('path');
app.set('views', path.join(__dirname + 'views'));

app.use(express.static(__dirname + '/public'));

app.use(require('./config/routes.js'));

app.listen(PORT, function(){
	console.log('Express server started at '+ PORT + '!');
});