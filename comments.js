// Create web server to handle comments and likes
//mas comentarios sin sentido
var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var cookieParser = require('cookie-parser');
var session = require('express-session');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var mysql = require('mysql');
var db = require('./db');
var connection = mysql.createConnection(db);

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));
app.use(express.static('public'));

// Allow cross origin requests
app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	next();
});

// Get all comments for a photo
app.get('/comments/:photo_id', function(req, res) {
	var photo_id = req.params.photo_id;
	connection.query('SELECT * FROM comments WHERE photo_id = ?', [photo_id], function(err, rows) {
		if (err) throw err;
		res.json(rows);
	});
});

// Get all likes for a photo
app.get('/likes/:photo_id', function(req, res) {
	var photo_id = req.params.photo_id;
	connection.query('SELECT * FROM likes WHERE photo_id = ?', [photo_id], function(err, rows) {
		if (err) throw err;
		res.json(rows);
	});
});

// Add a comment
app.post('/comments', urlencodedParser, function(req, res) {
	var photo_id = req.body.photo_id;
	var username = req.body.username;
	var comment = req.body.comment;
	var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
	connection.query('INSERT INTO comments (photo_id, username, comment, date) VALUES (?, ?, ?, ?)', [photo_id, username, comment, date], function(err, rows) {
		if (err) throw err;
		res.send("success");
	});
});

// Add a like
app.post('/likes', urlencodedParser, function(req, res) {
	var photo_id = req.body.photo_id;
	var username = req.body.username;
	connection.query('SELECT * FROM likes WHERE photo_id = ? AND username = ?', [photo_id, username], function(err, rows) {
        if (err) throw err;
        if (rows.length == 0) {
            connection.query('INSERT INTO likes (photo_id, username) VALUES (?, ?)', [photo_id, username], function(err, rows) {
                if (err) throw err;
                res.send("success");
            });
        } else {
            res.send("already liked");
        }
    });
});
