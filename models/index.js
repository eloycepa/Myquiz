var path = require('path');

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Postgres 
var DATABASE_URL = "DATABASE_URL";
// SQLite   
//var DATABASE_URL = sqlite://:@:/
var url = DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);

var DATABASE_PROTOCOL = url[1];
var DATABASE_DIALECT  = url[1];
var DATABASE_USER     = url[2];
var DATABASE_PASSWORD = url[3];
var DATABASE_HOST     = url[4];
var DATABASE_PORT     = url[5];
var DATABASE_NAME     = url[6];

var DATABASE_STORAGE  = process.env.DATABASE_STORAGE;


// Usar BBDD SQLite o Postgres   //
var sequelize = new Sequelize(DATABASE_NAME, 
                DATABASE_USER, 
                DATABASE_PASSWORD, 
                      { dialect:  DATABASE_DIALECT, 
                        protocol: DATABASE_PROTOCOL, 
                        port:     DATABASE_PORT,
                        host:     DATABASE_HOST,
                        storage:  DATABASE_STORAGE,   // solo local (.env)
                        omitNull: true                // solo Postgres
                      });                                                
                        

// Importar la definicion de la tabla Quiz de quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));

// Importar la definicion de la tabla Quiz de user.js
var User = sequelize.import(path.join(__dirname,'user'));


// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync()
    .then(function() {
        // Ya se han creado las tablas necesarias.
        return Quiz.count()
                .then(function (c) {
                    if (c === 0) {   // la tabla se inicializa solo si está vacía
                        return Quiz.bulkCreate([ {question: 'Capital de Italia',   answer: 'Roma'},
                                                 {question: 'Capital de Portugal', answer: 'Lisboa'}
                                              ])
                                   .then(function() {
                                        console.log('Base de datos inicializada con datos');
                                    });
                    }
                });
    })
    .catch(function(error) {
        console.log("Error Sincronizando las tablas de la BBDD:", error);
        process.exit(1);
    });


exports.Quiz = Quiz; // exportar definición de tabla Quiz

exports.User = User; // exportar definición de tabla User