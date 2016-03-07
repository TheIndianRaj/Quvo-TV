var express = require('express');
var _ = require('underscore');
var app = express();
var bodyParser = require('body-parser');
var db = require('../config/db.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.route('/videos')
	.get(function(req, res){
		res.render('videos');
	};