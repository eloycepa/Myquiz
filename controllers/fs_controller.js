var Sequelize = require('sequelize');
var Promise = Sequelize.Promise;

require('string-natural-compare');


var fs = Promise.promisifyAll(require("fs"));
var Path = require("path");
var util = require('util');



//Especificamos la ruta de nuestro archivo
var repositorio = "public/archivo";

// GET /archivo
exports.index = function(req, res, next) {

    //Lee el path que se le indica en la query
    var path = req.query.path;
    //Guarda el path de la carpeta contenedora de la anterior
    var backPath = Path.dirname(path);  

    if (path == "/") {
        //Si el path es el raiz del archivo es la última carpeta
        backPath = null;
    }

    //Invocamos a la función readDir
    readDir(path).then(function(data) {

        //Se crean cuatro arrays para almacenar los archivos por tipos
        var directories = [];
        var images = [];
        var movies = [];
        var otherfiles = [];

        //Se rellenan los arrays
        data.content.forEach(function(item) {

            if (item.dir) {
                directories.push(item);
            } else {
                var extension = Path.extname(item.name).toLowerCase();
                if (extension == ".jpeg" || 
                    extension == ".jpg"  ||
                    extension == ".png") {
                    images.push(item);
                } else if (extension == ".mp4") {
                    movies.push(item);  
                } else {              
                    otherfiles.push(item);
                }
            }
        });

        //Se carga la vista pasándole los arrays con los archivos y el breadcrumb
        res.render('fs/index', { breadcrumb: breadcrumb(data.title),
                                directories: directories,
                                images: images,
                                movies: movies,
                                otherfiles: otherfiles,
                                backPath: backPath} );
    });
};

//Esta función dado un path a un fichero va guardando información de todas las carpetas que lo contienen
//La vista utilizará esta información para cargar una barra informativa 
function breadcrumb(path) {
    var items = [ {title: "Archivos", path: "/"} ];
    while (path !== "/") {
        items.splice(1, 0,  {title: Path.basename(path), 
                             path: path} );
        path = Path.dirname(path);
    }
    return items;
}


function readDir(subdirName) {
    
    //Se monta el path completo en nuestra aplicación
    var dirName = Path.normalize(repositorio + "/" + subdirName);
    
    //Lectura del contenido del direcctorio especificado de manera asíncrona
    return fs.readdirAsync(dirName)
    //Primer flitro para no mostrar los archivos que empiecen por '.'
        .filter(function(filename) {
            console.log('filtrado archivos .');
            return filename.charAt(0) != "."; 
        })
        //Se ordenan los archivos 
        .then(function(filenames) {
            console.log('ordenacion de archivos');
            return filenames.sort(String.naturalCompare);
        })
        //Devuelve los ficheros especificando si son directorios o no, junto con su path relativo al archivo
        .map(function (fileName) {
            var path = Path.join(dirName, fileName);
            var subpath = Path.join(subdirName, fileName);
            return fs.statAsync(path).then(function(stat) {
                return stat.isDirectory() 
                    ? {dir: subpath,
                       name: fileName}
                    : {file: subpath,
                       name: fileName};
            });
        }).then(function(tree) {
            return {title: subdirName,
                    content: tree};
        });
}