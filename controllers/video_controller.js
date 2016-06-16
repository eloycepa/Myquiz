var url = require('url');
var path = require('path');
var fs = require('fs');
var zlib = require('zlib');

PORT = 5000;
// var path = require('path');

// var movie_mp4;

// fs.readFile(path.resolve(__dirname,"../public/videos/big_buck_bunny.mp4"), function (err, data) {
//     if (err) {
//         throw err;
//     }
//     movie_mp4 = data;
// });

exports.show = function(req, res, next){
	console.log('Se mete en el show');
	res.render('videos/show.ejs');
};

exports.streaming = function(req, res){
    var videoPath = 'public/videos/BigBuckBunny.mp4';
    var stat = fs.statSync(videoPath);
    var total = stat.size;
    console.log(req.headers);

    if(req.headers['range']){
        var range = req.headers.range;
        var parts = range.headers.replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total-1;
        var chunksize = (end-start)+1;
        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chuncksize);

        var file = fs.createReadStream(videoPath, {start: start, end: end});
        res.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total, 
                             "Accept-Ranges": "bytes",
                             "Content-Length": chunksize,
                             "Content-Type":"video/mp4"});
        file.pipe(res);        
    } else {
        console.log('ALL: ' + total);
        res.writeHead(200, { "Content-Length": total,
                             "Content-Type":"video/mp4"}); 
        fs.createReadStream(videoPath).pipe(res);
    }
};

exports.hls = function(req, res){
//   var uri = url.parse(req.url).pathname;
   res.render('videos/streaming.ejs');
};





