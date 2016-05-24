
var express = require('express');
var router = express.Router();

//var pass = ('./config/passport')
//var app = express();

var quizController = require('../controllers/quiz_controller');
var authController = require('../controllers/auth_controller')
var userController = require('../controllers/user_controller');

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

router.get('/users',                       userController.index);
router.get('/profile',			           userController.show); 

/*router.get('/auth/facebook',
  passport.authenticate('facebook'));*/

// router.get('/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

router.get('/auth/facebook',             authController.create);
router.get('/auth/facebook/callback/',    authController.fbcallback);
router.get('/logout',                    authController.destroy);                     


module.exports = router;
















