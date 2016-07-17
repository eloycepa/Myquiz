
var express = require('express');
var router = express.Router();

//var pass = ('./config/passport')
//var app = express();

var quizController = require('../controllers/quiz_controller');
var authController = require('../controllers/auth_controller');
var userController = require('../controllers/user_controller');
var videoController = require('../controllers/video_controller');
var fscontroller = require('../controllers/fs_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { user: req.user });
});

// Autoload de rutas 
router.param('quizId', quizController.load);  // autoload :quizId
router.param('userId', userController.load);  // autoload :userId


// Definición de rutas de /quizzes
router.get('/quizzes',                     quizController.index);
router.get('/quizzes/:quizId(\\d+)',       quizController.show);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);
router.get('/quizzes/new',                 quizController.new);
router.post('/quizzes',                    quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit',  quizController.edit);
router.put('/quizzes/:quizId(\\d+)',       quizController.update);
router.delete('/quizzes/:quizId(\\d+)',    quizController.destroy);

//Definición de rutas de usuario
router.get('/users',                       userController.index);
router.get('/profile',			           userController.show); 
router.delete('/users/:userId(\\d+)',      userController.destroy);

//Rutas referentes al video HLS
router.get('/video',                       videoController.show);
router.get('/video/streaming',             videoController.streaming);
router.get('/streaming',                   videoController.hls);
//router.get('/video/new',      );
//router.post('/video',      );

//Rutas para la autenticación con Facebook 
router.get('/auth/facebook',               authController.create);
router.get('/auth/facebook/callback/',     authController.fbcallback);
router.get('/logout',                      authController.destroy);    
          

//Ruta del archivo
router.get('/archivo', 					   authController.loginRequired, fscontroller.index);

module.exports = router;
















