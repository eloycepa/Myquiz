
// Configurar Passport

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var models = require('../models');

// load the auth variables

var configAuth = require('../config/auth');


//Serializa el usuario para la sesión
passport.serializeUser(function(user, done) {
    console.log("== SERIALIZEUSER ==");
//Serializa el id de usuario en la sesión    
    done(null, user.id);
});

// Deserializa el usuario
passport.deserializeUser(function(id, done) {
    console.log("== DESERIALIZEUSER ==");
    //Toma el id de usuario de la sesión y busca en la base de datos un usuario
    //Si lo encuentra estará accesible en req.user
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



//Definicón de la estrategia de Facebook que se va a emplear para la autenticación
passport.use(new FacebookStrategy({

        // Se especifican los credenciales de la App de Facebook que vamos a utilizar
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ["id", "birthday", "email", "first_name", "gender", "last_name"]

        
    }, function(token, refreshToken, profile, done) {
    
        // asynchronous
        process.nextTick(function() {

            //Encuentra el usuario en la base de datos filtrando por el id 
            var userId = parseInt(profile.id);

            //El siguiente log muestra los datos del usuario que Facebook nos devuelve después de un login correcto
            console.log(JSON.stringify(profile));

            models.User.findById(userId)
             .then(function(user) {
                if (user) {                                               
            // Si el usuario ya se ha logueado antes en la aplicación lo devuelve    
                    return done(null, user);                                
                } else {
            // Si es la primera vez, se crea un perfil para el usuario
                    console.log('Se empieza a crear el usuario');
                    var uname = profile.name.givenName   ||  " ";
                    console.log(uname);
                    var midname = profile.name.middleName  ||  " ";
                    console.log(midname);
                    var faname = profile.name.familyName   ||  " ";
                    console.log(faname);

            //Se crea un usuario a partir de los datos que se obtienen de objeto profile que nos devuelve Facebook
                    var user = models.User.build({ id:       userId,                   
                                                   name:     uname + " " + midname + " " + faname,
                                                   tocken:   profile.accessToken,                    
                                                   email:    profile.emails[0].value
                                               });
            //Se guarda el usuario en la base de datos
                    user.save({fields: ["id", "name", "token", "email"]})       
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

// Redirecciona en función de exito en el login o fallo
exports.fbcallback = function(req, res, next){
    passport.authenticate('facebook',{
        successRedirect : '/profile',
        failureRedirect : '/'
    })(req, res, next);
};

//Comprueba si existe la sesión
exports.loginRequired = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.render('users/nolog.ejs');
    }
};


// DELETE /session   -- Destruir sesion 
exports.destroy = function(req, res, next) {

    delete req.logout();
    
    res.redirect("/"); // redirect a la home
};
