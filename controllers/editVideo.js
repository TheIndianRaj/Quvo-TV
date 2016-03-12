var express = require('express');
var _ = require('underscore');

var app = express();
var bodyParser = require('body-parser');
var db = require('../config/db.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


function editVideoGet(req, res){
	var id = parseInt(req.params.id);
	var videoTypeName = '';
	var artists = new Array();
	var genres = new Array();
	var tags = new Array();
	var socialMediaTags = new Array();
	var series = new Object();
	var team = new Object();
	var video = new Object();
	var tables = [
		'types',
		'videos',
		'teams', 
		'artists',
		'genres', 
		'series', 
		'tags', 
		'social_media_tags'
	],
	i = 0,
	options = new Array();

	db.query('CALL getDropdownOptions();', function(err, rows, fields) {
		if(!err){
			initialOptions(rows).then(function(){
				db.query('CALL editVideoGet('+id+');', function(err, rows, fields) {
					if (!err){
						getEditValues(rows).then(function(){
							renderPage();
						});
					}
					else{
						console.log(err);
					}
				});
			});
		}

		function initialOptions(rows) {
			return new Promise(function(resolve, reject){
				
				rows.forEach(function(items){
					table = tables[i++];
					var column = 'name';
					if(table === 'videos'){
						column = 'title';
					}
					if(table !== undefined){
						for(var row in items){
							var obj = {
								table: table,
								id: items[row]["id"],
								name: items[row][column]
							};
							options.push(obj);
						}
					}
				});
				resolve();
			});
		}

		function getEditValues(rows){
			return new Promise(function(resolve, reject){
				var ids ={
					video : [],
					artists : [],
					genres : [],
					tags: [],
					socialMediaTags: [],
					series: [],
					teams: []
				};
				rows[0].forEach(function(row){
					if(!_.isNull(row.videoId) && ids.video.indexOf(row.videoId) === -1 ){
						video = {
							id : parseInt(row.videoId),
							type: parseInt(row.videoType),
							title: row.videoTitle,
							description: row.videoDescription,
							imdb_link: row.videoImdbLink,
							rotten_tomatoes_link : row.videoRottenTomatoesLink,
							youtube_link: row.videoYoutubeLink,
							age_restriction: parseInt(row.videoAgeRestriction),
							bg_pic: row.videoBgPic,
							thumbnails: row.videoThumbnails,
							status: parseInt(row.videoStatus),
							uploaded: parseInt(row.videoUploaded)
						};
						ids.video.push(row.videoId);
					}
					if(!_.isNull(row.artistId) && ids.artists.indexOf(row.artistId) === -1 ){
						artists.push({
							id: parseInt(row.artistId),
							name: row.artistName
						});
						ids.artists.push(row.artistId);
					}
					if(!_.isNull(row.genreId) && ids.genres.indexOf(row.genreId) === -1 ){
						genres.push({
							id: parseInt(row.genreId),
							name: row.genreName
						});
						ids.genres.push(row.genreId);
					}
					if(!_.isNull(row.tagId) && ids.tags.indexOf(row.tagId) === -1 ){
						tags.push({
							id: parseInt(row.tagId),
							name: row.tagName
						});
						ids.tags.push(row.tagId);
					}
					if(!_.isNull(row.socialMediaTagId) && ids.socialMediaTags.indexOf(row.socialMediaTagId) === -1 ){
						socialMediaTags.push({
							id: parseInt(row.socialMediaTagId),
							name: row.socialMediaTagName
						});
						ids.socialMediaTags.push(row.socialMediaTagId);
					}
					if(!_.isNull(row.teamId) && ids.teams.indexOf(row.teamId) === -1 ){
						team = {
							id: parseInt(row.teamId),
							name: row.teamName
						};
						ids.teams.push(row.teamId);
					}
					if(!_.isNull(row.seriesId) && ids.series.indexOf(row.seriesId) === -1 ){
						series = {
							id: parseInt(row.seriesId),
							name: row.seriesName,
							season: parseInt(row.seriesSeason),
							episode: parseInt(row.seriesEpisode)
						};
						ids.series.push(row.seriesId);
					}

				});
				resolve();
			});
		}

		function renderPage(){
			console.log({ 
				dropdown: options,
				video: video,
				videoTypeName: videoTypeName,
				artists: artists,
				genres: genres,
				tags: tags,
				socialMediaTags: socialMediaTags,
				series: series,
				team: team
			});
			res.render('editVideo', { 
				dropdown: options,
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
}

app.route('/video/edit/:id')
	.get(editVideoGet);


	// 	function(req, res){

	// 	db.query('CALL getDropdownOptions()', function(err, rows, fields) {
	// 		if (!err){
				
	// 				db.query('SELECT * FROM videos WHERE id='+id+';', function(err, rows, fields){
	// 					if(!err){
	// 						storeTableDetails(rows, 'video').then(function(id){
	// 							db.query('SELECT * FROM types WHERE status=1 AND id='+id+';', function(err, rows, fields){
	// 								if(!err){
	// 									storeTableDetails(rows, 'types').then(function(id){
	// 										db.query('SELECT * FROM artists WHERE status=1 AND id IN (SELECT artist_id FROM video_artist_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
	// 											if(!err){
	// 												storeTableDetails(rows, 'artists').then(function(id){
	// 													db.query('SELECT * FROM genres WHERE status=1 AND id IN (SELECT genre_id FROM video_genre_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
	// 														if(!err){
	// 															storeTableDetails(rows, 'genres').then(function(id){
	// 																db.query('SELECT * FROM tags WHERE status=1 AND id IN (SELECT tag_id FROM video_tag_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
	// 																	if(!err){
	// 																		storeTableDetails(rows, 'tags').then(function(id){
	// 																			db.query('SELECT * FROM social_media_tags WHERE status=1 AND id IN (SELECT social_media_tag_id FROM video_social_media_tag_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
	// 																				if(!err){
	// 																					storeTableDetails(rows, 'socialMediaTags').then(function(id){
	// 																						db.query('SELECT * FROM series WHERE status=1 AND id IN (SELECT series_id FROM video_series_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
	// 																							if(!err){
	// 																								storeTableDetails(rows, 'series_name').then(function(id){
	// 																									db.query('SELECT * FROM video_series_mappings WHERE status=1 AND video_id='+id+';', function(err, rows, fields){
	// 																										if(!err){
	// 																											storeTableDetails(rows, 'series_season').then(function(id){
	// 																												db.query('SELECT * FROM teams WHERE status=1 AND id IN (SELECT team_id FROM video_team_mappings WHERE status=1 AND video_id='+id+');', function(err, rows, fields){
	// 																													if(!err){

	// 																														storeTableDetails(rows, 'team').then(function(id){
	// 																															renderPage();
	// 																														});
	// 																													}
	// 																													else{
	// 																														console.log(err);
	// 																													}
	// 																												});
	// 																											});
	// 																										}
	// 																										else{
	// 																											console.log(err);
	// 																										}
	// 																									});
	// 																								});
	// 																							}
	// 																							else{
	// 																								console.log(err);
	// 																							}
	// 																						});
	// 																					});
	// 																				}
	// 																				else{
	// 																					console.log(err);
	// 																				}
	// 																			});
	// 																		});
	// 																	}
	// 																	else{
	// 																		console.log(err);
	// 																	}
	// 																});
	// 															});
	// 														}
	// 														else{
	// 															console.log(err);
	// 														}
	// 													});
	// 												});
	// 											}
	// 											else{
	// 												console.log(err);
	// 											}
	// 										});
	// 									});
	// 								}
	// 								else{
	// 									console.log(err);
	// 								}
	// 							});
	// 						})
							
	// 					}
	// 					else{
	// 						console.log(err);
	// 					}
	// 				});	
	// 			});		 
	// 		}
	// 		else{
	// 			console.log(err);
	// 		}
	// 	});


	// 	function storeTableDetails(rows, checkString){
	// 		return new Promise(function(resolve, reject){
	// 			if(checkString === 'video'){
	// 				video = rows[0];
	// 				var sec_num = parseInt(video.duration, 10); // don't forget the second param
	// 			    var hours   = Math.floor(sec_num / 3600);
	// 			    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	// 			    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	// 			    if (hours   < 10) {hours   = "0"+hours;}
	// 			    if (minutes < 10) {minutes = "0"+minutes;}
	// 			    if (seconds < 10) {seconds = "0"+seconds;}
	// 			    video.convertedDuration    = hours+':'+minutes+':'+seconds;
	// 				resolve(video.type);
	// 			}
	// 			else if(checkString === 'types'){
	// 				if(rows)
	// 					videoTypeName = rows[0].name;
	// 				resolve(video.id);
	// 			}
	// 			else if(checkString === 'artists'){
	// 				if(rows){
	// 					rows.forEach(function(row){
	// 						artists.push({
	// 							id: row.id,
	// 							name: row.name
	// 						});
	// 					});
	// 				}
	// 				resolve(video.id);
	// 			}
	// 			else if(checkString === 'genres'){
	// 				if(rows){
	// 					rows.forEach(function(row){
	// 						genres.push({
	// 							id: row.id,
	// 							name: row.name
	// 						});
	// 					});
	// 				}
	// 				resolve(video.id);
	// 			}
	// 			else if(checkString === 'tags'){
	// 				if(rows){
	// 					rows.forEach(function(row){
	// 						tags.push({
	// 							id: row.id,
	// 							name: row.name
	// 						});
	// 					});
	// 				}
	// 				resolve(video.id);
	// 			}
	// 			else if(checkString === 'socialMediaTags'){
	// 				if(rows){
	// 					rows.forEach(function(row){
	// 						socialMediaTags.push({
	// 							id: row.id,
	// 							name: row.name
	// 						});
	// 					});
	// 				}
	// 				resolve(video.id);
	// 			}
	// 			else if(checkString === 'series_name'){
	// 				if(rows){
	// 					series.id = rows[0].id;
	// 					series.name = rows[0].name;
	// 				}
	// 				resolve(video.id);
	// 			}
	// 			else if(checkString === 'series_season'){
	// 				if(rows){
	// 					series.season = rows[0].season;
	// 					series.episode = rows[0].episode;
	// 				}
	// 				resolve(video.id);
	// 			}
	// 			else if(checkString === 'team'){
	// 				if(rows){
	// 					team.id = rows[0].id;
	// 					team.name = rows[0].name;
	// 				}
	// 				resolve(video.id);
	// 			}
	// 		});
	// 	}




module.exports = app;