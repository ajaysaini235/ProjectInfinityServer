var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();
var CONSTANT = require("./util/Constant");
var app = express();
var mongoose = require("mongoose");
mongoose.connect(CONSTANT.MONGO_SERVER);

var FIREBASE = require('./firebase.js');
var Users = require('./routes/Users');
var Posts = require('./routes/Posts');
var Likes = require('./routes/Likes');
var Comments = require('./routes/Comments');
var Friends = require('./routes/Friends');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'uploads')));

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, id-token , Accept");
    next();
});


app.use(function(req, res, next) {
    try{
        FIREBASE.verifyIdToken(req.headers["id-token"], function(user) {
            if (user.status) {
                req["me"] = user.result;
            } else {
                req["error"] = user;
            }
            next();
        });
    } catch(e){
        console.log(e);
    }
});


app.use('/users', Users);
app.use('/posts', Posts);
app.use('/like', Likes);
app.use('/comment', Comments);
app.use('/friend', Friends);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
