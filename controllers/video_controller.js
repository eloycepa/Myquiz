
var fs = require('fs');
var path = require('path');

var movie_mp4;

fs.readFile(path.resolve(__dirname,"../public/videos/big_buck_bunny.mp4"), function (err, data) {
    if (err) {
        throw err;
    }
    movie_mp4 = data;
});

exports.show = function(req, res, next){
	console.log('Se mete en el show');
	res.render('videos/show.ejs');
};

exports.streaming = function(req, res){
	var total;
    if(movie_mp4){
        total = movie_mp4.length;
    }  
    var range = "bytes=0-";

    console.log(req.headers);
 //   console.log(req);

    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    // if last byte position is not present then it is the last byte of the video file.
    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    var chunksize = (end-start)+1;

    if(movie_mp4){
        res.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total, 
                             "Accept-Ranges": "bytes",
                             "Content-Length": chunksize,
                             "Content-Type":"video/mp4"});
        res.end(movie_mp4.slice(start, end+1), "binary");
    }
};
