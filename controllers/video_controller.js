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
    var uri = url.parse(req.url).pathname;

    console.log('URI ================>>>>>> : ' + uri); 

    if (uri == '/streaming/player') {
  //      Console.log('URI ================>>>>>> : ' + uri); 
        res.render('videos/streaming.ejs');
        res.end();
        return;
    }

    var filename = path.join("./", uri);
    fs.exists(filename, function (exists) {
        if (!exists) {
            console.log('file not found: ' + filename);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('file not found: %s\n', filename);
            res.end();
        } else {
            console.log('ENTROOOOOOO=========!=!=!=!=!=!!=!=!=!=!=!')
            console.log('sending file: ' + filename);
            switch (path.extname(uri)) {
            case '.m3u8':
                fs.readFile(filename, function (err, contents) {
                    if (err) {
                        res.writeHead(500);
                        res.end();
                    } else if (contents) {
                        res.writeHead(200,
                            {'Content-Type':
                            'application/vnd.apple.mpegurl'});
                        var ae = req.headers['accept-encoding'];
                        if (ae.match(/\bgzip\b/)) {
                            zlib.gzip(contents, function (err, zip) {
                                if (err) throw err;

                                res.writeHead(200,
                                    {'content-encoding': 'gzip'});
                                res.end(zip);
                            });
                        } else {
                            res.end(contents, 'utf-8');
                        }
                    } else {
                        console.log('emptly playlist');
                        res.writeHead(500);
                        res.end();
                    }
                });
                break;
            case '.ts':
                res.writeHead(200, { 'Content-Type':
                    'video/MP2T' });
                var stream = fs.createReadStream(filename,
                    { bufferSize: 64 * 1024 });
                stream.pipe(res);
                break;
            default:
                console.log('unknown file type: ' +
                    path.extname(uri));
                res.writeHead(500);
                res.end();
            }
        }
    });
};





