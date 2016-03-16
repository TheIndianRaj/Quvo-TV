var express = require('express');
var _ = require('underscore');
var app = express();
var bodyParser = require('body-parser');
var db = require('../config/db.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.route('/videos/add')
	.get(function(req, res){
		
		db.query('CALL getDropdownOptions()', function(err, rows, fields) {

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

			if (!err){
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
						 
				res.render('addVideo', { dropdown: options});
			}
			else{
				console.log(err);
			}
		});		
	})

	.post(function(req, res){
		var fields = ['type', 'title', 'description', 'team', 'artists', 'genres', 'imdbUrl', 'rottenTomatoesUrl', 'ageRestriction', 'tags', 'socialMediaTags', 'youtubeUrl', 'seriesId', 'seriesSeason', 'seriesEpisode', 'mainVideoId'];
		var db = require('../config/db.js');

		var data = _.pick(req.body, function(value, key, data){
			if(fields.indexOf(key) !== -1){
				return key;
			}
		});

		if (!data.hasOwnProperty('youtubeCheckbox')) {
			data.youtubeUrl = null;
		}

		if(data.type === 1){
			data.mainVideoId = null;
		}

		data.artistIds = [];
		data.tagIds = [];
		data.socialMediaTagIds = [];

		var flag = {
			artists : (data.hasOwnProperty('artists')) ? false: true,
			tags: (data.hasOwnProperty('tags')) ? false: true,
			socialMediaTags: (data.hasOwnProperty('socialMediaTags')) ? false: true
		};


		if (data.hasOwnProperty('artists') && !_.isEmpty(data.artists)) {
			if(typeof data.artists === 'string')
				data.artists = new Array(data.artists);
			data.artists.forEach(function(artist, key){
				artist = artist.trim();
				var isNum = /^\d+$/.test(artist);
				if(!isNum && !_.isEmpty(artist)){
					db.query('SET  @artistId= -1; CALL insertArtist("'+artist+'", @artistId); SELECT @artistId;', function(err, rows, fields) {

						if (!err){
							storeId(rows[2][0], 'artist').then(function(){
								checkInsertVideo();
							});

						}
						else{
							console.log(err);
						}
					});
				}
				else if(isNum){
					data.artistIds.push(parseInt(artist));
					if(data.artists.length === data.artistIds.length){
							flag.artists = true;
							checkInsertVideo();
					}
				}
			});
		}
		
		if (data.hasOwnProperty('tags') && !_.isEmpty(data.tags)) {
			if(typeof data.tags === 'string')
				data.tags = new Array(data.tags);
			data.tags.forEach(function(tag, key){
				tag = tag.trim();
				var isNum = /^\d+$/.test(tag);
				if(!isNum && !_.isEmpty(tag)){
					db.query('SET  @tagId= -1; CALL insertTag("'+tag+'", @tagId); SELECT @tagId;', function(err, rows, fields) {

						if (!err){
							storeId(rows[2][0], 'tag').then(function(){
								checkInsertVideo();
							});

						}
						else{
							console.log(err);
						}
					});
				}
				else if(isNum){
					data.tagIds.push(parseInt(tag));
					if(data.tags.length === data.tagIds.length){
						flag.tags = true;
						checkInsertVideo();
					}
				}
			});
		}


		if (data.hasOwnProperty('socialMediaTags') && !_.isEmpty(data.socialMediaTags)) {
			if(typeof data.socialMediaTags === 'string')
				data.socialMediaTags = new Array(data.socialMediaTags);
			data.socialMediaTags.forEach(function(socialMediaTag, key){
				socialMediaTag = socialMediaTag.trim();
				var isNum = /^\d+$/.test(socialMediaTag);
				if(!isNum && !_.isEmpty(socialMediaTag)){
					db.query('SET  @socialMediaTagId= -1; CALL insertSocialMediaTag("'+socialMediaTag+'", @socialMediaTagId); SELECT @socialMediaTagId;', function(err, rows, fields) {

						if (!err){
							storeId(rows[2][0], 'socialMediaTag').then(function(){
									checkInsertVideo();
							});
						}
						else{
							console.log(err);
						}
					});
				}
				else if(isNum){
					data.socialMediaTagIds.push(parseInt(socialMediaTag));
					if(data.socialMediaTags.length === data.socialMediaTagIds.length){
						flag.socialMediaTags = true;
						checkInsertVideo();
					}
				}
			});
		}

		function storeId(obj, checkString){
			return new Promise(function(resolve, reject){
				var pushed = false;
				for(var key in obj){
					if(checkString === 'tag'){
						data.tagIds.push(obj[key]);
						if(data.tags.length === data.tagIds.length){
							flag.tags = true;
						}
						pushed = true;
					}
					else if(checkString === 'artist'){
						data.artistIds.push(obj[key]);
						if(data.artists.length === data.artistIds.length){
							flag.artists = true;
						}
						pushed = true;
					}
					else if(checkString === 'socialMediaTag'){
						data.socialMediaTagIds.push(obj[key]);
						if(data.socialMediaTags.length === data.socialMediaTagIds.length){
							flag.socialMediaTags = true;
						}
						pushed = true;
					}
					break;
				}
				if(pushed){
					resolve();
				}
			});
		}

		function checkInsertVideo(){
			if(flag.artists && flag.tags && flag.socialMediaTags){
				if(data.hasOwnProperty('type') && !_.isEmpty(data.type) && data.hasOwnProperty('title') && !_.isEmpty(data.title)){
					db.query('SET  @videoId= -1; CALL insertVideo("'+
						parseInt(data.type)+
						'","'+data.title+
						'","'+data.description+
						'","'+parseInt(data.team)+
						'","'+parseInt(data.seriesId)+
						'","'+parseInt(data.season)+
						'","'+parseInt(data.episode)+
						'","'+parseInt(data.ageRestriction)+
						'","'+data.imdbUrl+
						'","'+data.rottenTomatoesUrl+
						'","'+data.youtubeUrl+
						'","'+parseInt(data.mainVideoId)+
						'",@videoId); SELECT @videoId;', function(err, rows, fields) {

						if (!err){
							insertMultipleMappings(rows[2][0]).then(function(videoId){
								pageRedirect(videoId);
							});

						}
						else{
							console.log(err);
						}
					});
				}
			}
		}

		function pageRedirect(videoId){
			res.redirect('/test');
		}

		function insertMultipleMappings(obj){
			return new Promise(function(resolve, reject){
				var inserted = {
					artists: false,
					genres: false,
					tags: false,
					socialMediaTags: false
				};

				var count = {
					artists: 0,
					genres: 0,
					tags: 0,
					socialMediaTags: 0
				};

				var videoId = -1;
				for(var key in obj){
					videoId = obj[key];
					break;
				}

				if(videoId > 0 && !_.isEmpty(data.artistIds)){
					data.artistIds.forEach(function(artist){
						db.query('CALL insertVideoArtistMapping("'+videoId+'", "'+artist+'");', function(err, rows, fields) {
							if(!err){
								checkSingleInsertion('artist').then(function(){
									checkAllInsertions();
								});
							}
							else{
								console.log(err);
							}
						});
					});
				}
				if(videoId > 0 && !_.isEmpty(data.genres)){
					if(typeof data.genres === 'string')
						data.genres = new Array(data.genres);
					data.genres.forEach(function(genre){
						db.query('CALL insertVideoGenreMapping("'+videoId+'", "'+parseInt(genre)+'");', function(err, rows, fields) {
							if(!err){
								checkSingleInsertion('genre').then(function(){
									checkAllInsertions();
								});
							}
							else{
								console.log(err);
							}
						});
					});
				}
				if(videoId > 0 && !_.isEmpty(data.tagIds)){
					data.tagIds.forEach(function(tag){
						db.query('CALL insertVideoTagMapping("'+videoId+'", "'+tag+'");', function(err, rows, fields) {
							if(!err){
								checkSingleInsertion('tag').then(function(){
									checkAllInsertions();
								});
							}
							else{
								console.log(err);
							}
						});
					});
				}
				if(videoId > 0 && !_.isEmpty(data.socialMediaTagIds)){
					data.socialMediaTagIds.forEach(function(socialMediaTag){
						db.query('CALL insertVideoSocialMediaTagMapping("'+videoId+'", "'+socialMediaTag+'");', function(err, rows, fields) {
							if(!err){
								checkSingleInsertion('socialMediaTag').then(function(){
									checkAllInsertions();
								});
							}
							else{
								console.log(err);
							}
						});
					});
				}
				function checkSingleInsertion(checkString){
					return new Promise(function(resolve, reject){
						if(checkString === 'artist'){
							count.artists += 1;
							if(count.artists === data.artistIds.length){
								inserted.artists = true;
							}
						}
						else if(checkString === 'genre'){
							count.genres += 1;
							if(count.genres === data.genres.length){
								inserted.genres = true;
							}
						}
						else if(checkString === 'tag'){
							count.tags += 1;
							if(count.tags === data.tagIds.length){
								inserted.tags = true;
							}
						}
						else if(checkString === 'socialMediaTag'){
							count.socialMediaTags += 1;
							if(count.socialMediaTags === data.socialMediaTagIds.length){
								inserted.socialMediaTags = true;
							}
						}

						if(inserted.artists && inserted.genres && inserted.tags && inserted.socialMediaTags){
							resolve();
						}

					});
				}

				function checkAllInsertions(){
					resolve(videoId);
				}

			});
		}
		

	});

module.exports = app;