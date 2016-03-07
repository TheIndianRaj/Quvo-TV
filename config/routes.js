var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require('./db.js');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('../controllers/addVideo.js'));




app.get('/', function(req, res){
	res.render('index');
});


app.get('/videos', function(req, res){
	res.render('videos');
});


app.get('/test', function(req, res){
	res.render('test');
});

app.post('/test', function(req, res){
	console.log(req.body.username + " is the username") ;
	console.log(res);
	var res = '';
	db.connect();
	db.query('SELECT * from genres', function(err, rows, fields) {
	  	if (!err){
	  		res = rows;
	    	console.log('The solution is: ', rows);
		}
		else{
		    console.log('Error while performing Query.');
		}
	});
	db.end();
	res.render('test', res);
	// res.end('html');

});


module.exports = app;