var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'quvo_tv',
  multipleStatements: true
});

module.exports = db;
