var express = require('express');
var _ = require('underscore');
var app = express();
var bodyParser = require('body-parser');
var db = require('../config/db.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.route('/videos')
	.get(function(req, res){

		db.query('CALL getVideos(); cALL getTypes();', function(err, rows, fields){
			if(!err){
				var data = new Array();
				rows.forEach(function(items){
                  	if(items.constructor === Array){
                  		data.push(items);
                  	}
                });
				
				res.render('listVideos', { 
					videos: data[0],
					types: data[1]
				});
				
			}
			else{
				console.log(err);
			}
		});
	});

module.exports = app;