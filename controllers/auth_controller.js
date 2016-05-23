
// Configurar Passport

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var models = require('../models');

// load the auth variables

var configAuth = require('../config/auth');


// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    console.log("== SERIALIZEUSER ==");
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    console.log("== DESERIALIZEUSER ==");
    models.User.findById(id)
        .then(function(user) {
        if(user){
            done(null, user);
        } else {
            done(null, false);
      }})
    .catch(function(err){
        done(err);
    });
});
    //    profileFields   : ["id", "birthday", "email", "first_name", "gender", "last_name"]
 

//clientID        : configAuth.facebookAuth.clientID,
//clientSecret    : configAuth.facebookAuth.clientSecret,
//callbackURL     : configAuth.facebookAuth.callbackURL



passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ["id", "birthday", "email", "first_name", "gender", "last_name"]
   
    }, function(token, refreshToken, profile, done) {
    
        // asynchronous
        process.nextTick(function() {
            console.log("_==º_    _==º_");
            // find the user in the database based on their facebook id
            var userId = parseInt(profile.id);
            console.log(JSON.stringify(profile));

            models.User.findById(userId)
             .then(function(user) {
                if (user) {                                               // if the user is found, then log them in
                    console.log("_==º_  _==º_   _==º_");
                    console.log(stringify(user));
                    return done(null, user);                                // user found, return that user
                } else {
                    console.log('Se empieza a crear el usuario');

                    // if there is no user found with that facebook id, create them
                    // set the users facebook id
                    // name:     profile.name.givenName + ' ' + profile.name.familyName, // look at the passport user profile to see how names are returned
                    // we will save the token that facebook provides to the user 
                    var uname = profile.name.givenName   ||  " ";
                    console.log(uname);
                    var midname = profile.name.middleName  ||  " ";
                    console.log(midname);
                    var faname = profile.name.familyName   ||  " ";
                    console.log(faname);

                     var user = models.User.build({ id:       userId,                   
                                                   name:     uname + " " + midname + " " + faname,
                                                   tocken:   profile.accessToken,                    
                                                   email:    profile.emails[0].value
                                               });
    
                    user.save({fields: ["id", "name", "token", "email"]})       // save our user to the database
                          .then(function(user) {
                            console.log('success', 'Usuario creado con éxito.');
                          })
                          .catch(function(error) {
                            console.log('error', 'Error al crear el usuario: '+error.message);
                        });
                    return done(null, user);        
                }
            })
            .catch(function(error){next(error); });
        });
    
    }));


// POST /session   -- Crear la sesion si usuario se autentica
exports.create = function(req, res, next) {
    console.log('_=ª_ =========>');
    passport.authenticate('facebook', { scope : 'email' })(req, res, next);
        
};

exports.fbcallback = function(req, res, next){
    passport.authenticate('facebook',{
        successRedirect : '/profile',
        failureRedirect : '/'
    })(req, res, next);
};


// DELETE /session   -- Destruir sesion 
exports.destroy = function(req, res, next) {

    delete req.logout();
    
    res.redirect("/"); // redirect a la home
};
