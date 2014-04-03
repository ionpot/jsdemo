var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    ins = require('util').inspect,
    typeOf = function (ext) {
        switch (ext) {
            case 'js':
                return 'text/javascript';
            case 'css':
                return 'text/css';
            case 'html':
                return 'text/html';
            case 'appcache':
                return 'text/cache-manifest';
            default:
                return '';
        }
    },
    fileOf = function (url) {
        if (url.charAt(0) !== '/') {
            url = '/' + url;
        }
        return path.normalize(url).slice(1);
    },
    serve = function (req, res) {
        var url = req.url,
            file = fileOf(url),
            type, stream;

        if (url === '/') {
            res.writeHead(200, {'Content-Type': 'text/html'});
            fs.createReadStream('index.html').pipe(res);
        } else {
            type = typeOf(file.split('.').pop());
            stream = fs.createReadStream(file);
            stream.on('error', function () {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('Nope.');
            });
            stream.on('open', function () {
                console.log(file);
                res.writeHead(200, {'Content-Type': type});
                stream.pipe(res);
            });
        }
    };

http.createServer(serve).listen(8080);
