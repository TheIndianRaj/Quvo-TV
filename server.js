var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;



app.set('view engine', 'ejs');

var path = require ('path');

app.set('views', path.join(__dirname + '/public/views'));

app.use(express.static('public'));

app.get('/', function(req, res){
	res.render('index');
});

app.listen(PORT, function(){
	console.log('Express server started at '+ PORT + '!');
});