var models = require('../models');
var Sequelize = require('sequelize');


// Autoload el user asociado a :userId
exports.load = function(req, res, next, userId) {
    models.User.findById(userId)
        .then(function(user) {
            if (user) {
                req.user = user;
                next();
            } else {
                req.flash('error', 'No existe el usuario con id='+id+'.');
                next(new Error('No existe userId=' + userId));
            }
        })
        .catch(function(error) { next(error); });
};

exports.index = function(req, res, next) {
    models.User.findAll()
        .then(function(users) {
            console.log("INDEx");
            res.render('users/index.ejs', { users: users});
        })
        .catch(function(error) {
            next(error);
        });
};
 
exports.show = function(req, res, next) {
    if(req.user){
         res.render('users/profile.ejs', {
            user : req.user 
            }                                    // get the user out of session and pass to template
        )};
};



exports.isLoggedIn = function(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/session/facebook');
}