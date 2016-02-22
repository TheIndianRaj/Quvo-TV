var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;



app.set('view engine', 'ejs');

var path = require ('path');
// app.use();

app.set('views', path.join(__dirname + '/public/views'));


// app.use(express.static(path.join((__dirname+'/public'))));

app.use(express.static('public'));

app.get('/', function(req, res){
	res.render('index');
});

app.get('/new_bundle', function(req, res){
	res.render('new_bundle');
});

app.get('/existing_bundle', function(req, res){
	res.render('existing_bundle');
});

app.get('/add_team', function(req, res){
	res.render('add_team');
});

app.get('/add_series', function(req, res){
	res.render('add_series');
});


app.listen(PORT, function(){
	console.log('Express server started at '+ PORT + '!');
});