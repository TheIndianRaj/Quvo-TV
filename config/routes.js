var express = require('express');
var app = express();

app.use(require('../controllers/addVideo.js')); //Add Video Route


app.use(require('../controllers/listVideos.js')); //List Video Route




app.get('/', function(req, res){
	res.render('index');
});


// app.get('/videos', function(req, res){
// 	res.render('videos');
// });


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