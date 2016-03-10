var express = require('express');
var _ = require('underscore');

var app = express();
var bodyParser = require('body-parser');
var db = require('../config/db.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.route('/video/view/:id')
	.get(function(req, res){
		var id = parseInt(req.params.id);
		var videoTypeName = '';
		var artists = new Array();
		var genres = new Array();
		var tags = new Array();
		var socialMediaTags = new Array();
		var series = new Object();
		var team = new Array();

		var video = new Object();
		// data.flag = new Object();
		// data.series = new Array();
		// data.artists = new Array();
		// data.teams = new Array();
		// data.genres = new Array();
		// data.tags = new Array();
		// data.socialMediaTags = new Array();
		if(typeof id === 'number'){
			db.query('SELECT * FROM videos WHERE id='+id+';', function(err, rows, fields){
				if(!err){
					storeTableDetails(rows, 'video').then(function(id){
						db.query('SELECT * FROM types WHERE status=1 AND id='+id+';', function(err, rows, fields){
							if(!err){
								storeTableDetails(rows, 'types').then(function(id){
									db.query('SELECT * FROM artists WHERE status=1 AND id IN (SELECT artist_id FROM video_artist_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
										if(!err){
											storeTableDetails(rows, 'artists').then(function(id){
												db.query('SELECT * FROM genres WHERE status=1 AND id IN (SELECT genre_id FROM video_genre_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
													if(!err){
														storeTableDetails(rows, 'genres').then(function(id){
															db.query('SELECT * FROM tags WHERE status=1 AND id IN (SELECT tag_id FROM video_tag_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
																if(!err){
																	storeTableDetails(rows, 'tags').then(function(id){
																		db.query('SELECT * FROM social_media_tags WHERE status=1 AND id IN (SELECT social_media_tag_id FROM video_social_media_tag_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
																			if(!err){
																				storeTableDetails(rows, 'socialMediaTags').then(function(id){
																					db.query('SELECT * FROM series WHERE status=1 AND id IN (SELECT series_id FROM video_series_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
																						if(!err){
																							storeTableDetails(rows, 'series_name').then(function(id){
																								db.query('SELECT * FROM video_series_mappings WHERE status=1 AND video_id='+id+';', function(err, rows, fields){
																									if(!err){
																										storeTableDetails(rows, 'series_season').then(function(id){
																											db.query('SELECT * FROM teams WHERE status=1 AND id IN (SELECT team_id FROM video_team_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
																												if(!err){

																													storeTableDetails(rows, 'team').then(function(id){
																														renderPage();
																													});
																												}
																												else{
																													console.log(err);
																												}
																											});
																										});
																									}
																									else{
																										console.log(err);
																									}
																								});
																							});
																						}
																						else{
																							console.log(err);
																						}
																					});
																				});
																			}
																			else{
																				console.log(err);
																			}
																		});
																	});
																}
																else{
																	console.log(err);
																}
															});
														});
													}
													else{
														console.log(err);
													}
												});
											});
										}
										else{
											console.log(err);
										}
									});
								});
							}
							else{
								console.log(err);
							}
						});
					})
					
				}
				else{
					console.log(err);
				}
			});		
		}

		// function storeVideoDetails(rows){
		// 	var gotVideoDetail = false;
		// 	return new Promise(function(resolve, reject){
		// 		rows.forEach(function(items){
		// 			if(items.constructor === Array){
		// 				items.forEach(function(row){
		// 					for(var key in row){
		// 						if(key === '@series'){
		// 							data.flag.series = row[key];
		// 						}
		// 						else if(key === '@artists'){
		// 							data.flag.artists = row[key];
		// 						}
		// 						else if(key === '@teams'){
		// 							data.flag.teams = row[key];
		// 						}
		// 						else if(key === '@genres'){
		// 							data.flag.genres = row[key];
		// 						}
		// 						else if(key === '@tags'){
		// 							data.flag.tags = row[key];
		// 						}
		// 						else if(key === '@socialMediaTags'){
		// 							data.flag.socialMediaTags = row[key];
		// 						}
		// 					}
		// 					if(row.hasOwnProperty('title')){
		// 						data.video = row;

		// 					}
		// 					else if(row.hasOwnProperty('series_id')){
		// 						data.series.push(row);
		// 						gotVideoDetail = true;
		// 					}
		// 					else if(row.hasOwnProperty('artist_id')){
		// 						data.artists.push(row);
		// 					}
		// 					else if(row.hasOwnProperty('team_id')){
		// 						data.teams.push(row);
		// 					}
		// 					else if(row.hasOwnProperty('genre_id')){
		// 						data.genres.push(row);
		// 					}
		// 					else if(row.hasOwnProperty('tag_id')){
		// 						data.tags.push(row);
		// 					}
		// 					else if(row.hasOwnProperty('social_media_tag_id')){
		// 						data.socialMediaTags.push(row);
		// 					}
		// 				});
		// 			}
		// 		});
		// 		if(gotVideoDetail)
		// 			resolve(data.video.type);
		// 	});
		// }

		function storeTableDetails(rows, checkString){
			return new Promise(function(resolve, reject){
				if(checkString === 'video'){
					video = rows[0];
					var sec_num = parseInt(video.duration, 10); // don't forget the second param
				    var hours   = Math.floor(sec_num / 3600);
				    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
				    var seconds = sec_num - (hours * 3600) - (minutes * 60);

				    if (hours   < 10) {hours   = "0"+hours;}
				    if (minutes < 10) {minutes = "0"+minutes;}
				    if (seconds < 10) {seconds = "0"+seconds;}
				    video.convertedDuration    = hours+':'+minutes+':'+seconds;
					resolve(video.type);
				}
				else if(checkString === 'types'){
					if(rows)
						videoTypeName = rows[0].name;
					resolve(video.id);
				}
				else if(checkString === 'artists'){
					if(rows){
						rows.forEach(function(row){
							artists.push({
								id: row.id,
								name: row.name
							});
						});
					}
					resolve(video.id);
				}
				else if(checkString === 'genres'){
					if(rows){
						rows.forEach(function(row){
							genres.push({
								id: row.id,
								name: row.name
							});
						});
					}
					resolve(video.id);
				}
				else if(checkString === 'tags'){
					if(rows){
						rows.forEach(function(row){
							tags.push({
								id: row.id,
								name: row.name
							});
						});
					}
					resolve(video.id);
				}
				else if(checkString === 'socialMediaTags'){
					if(rows){
						rows.forEach(function(row){
							socialMediaTags.push({
								id: row.id,
								name: row.name
							});
						});
					}
					resolve(video.id);
				}
				else if(checkString === 'series_name'){
					if(rows){
						series.id = rows[0].id;
						series.name = rows[0].name;
					}
					resolve(video.id);
				}
				else if(checkString === 'series_season'){
					if(rows){
						series.season = rows[0].season;
						series.episode = rows[0].episode;
					}
					resolve(video.id);
				}
				else if(checkString === 'team'){
					if(rows)
						team = rows[0].name;
					resolve(video.id);
				}
			});
		}

		function renderPage(){
			res.render('viewVideo', {
				video: video,
				videoTypeName: videoTypeName,
				artists: artists,
				genres: genres,
				tags: tags,
				socialMediaTags: socialMediaTags,
				series: series,
				team: team
			});
		}
	});


module.exports = app;