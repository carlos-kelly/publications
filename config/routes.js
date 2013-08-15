
/**
 * Publications JS API
 * Routes Configuration
 * Michael Kelly and Carlos Paelinck
 */

var express = require('express'),
    mongoose = require('mongoose');

var IndexController = require('../controllers/index'),
    UserController = require('../controllers/user'),
    DocumentController = require('../controllers/document'),
    ShapeController = require('../controllers/shape');

var auth = function (req, res, next) {
    if (!req.isAuthenticated()) res.send(401);
    else next();
};

module.exports = function (app, passport) {
    // Index routes
    app.get('/', IndexController.index);

    // Application routes
    app.get('/app/user', auth, function(req, res) { res.send(req.user); });
    app.post('/app/signin', passport.authenticate('local'), function(req, res) { res.send(req.user); });
    app.get('/app/signout', function(req, res){ req.logout(); res.json({}); });

    // User model routes
    app.get('/user/:id?', auth, UserController.show);

    // Document model routes
    app.get('/documents', auth, DocumentController.index);

    // Shape model routes
    app.get('/shapes/:id?', auth, ShapeController.index);

};