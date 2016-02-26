var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;



app.set('view engine', 'ejs');

var path = require ('path');

app.set('views', path.join(__dirname + '/public/views'));

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.render('index');
});

app.get('/videos', function(req, res){
	res.render('videos');
});

app.get('/videos/add', function(req, res){
	res.render('addVideo');
});

app.listen(PORT, function(){
	console.log('Express server started at '+ PORT + '!');
});