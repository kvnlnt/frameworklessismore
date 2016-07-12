const pkg = require('../package');
const fs = require("fs");
const http = require('http');
const exec = require('child_process').exec;
const path = require('path');
const chalk = require('chalk');

// content type enums
const CONTENT_TYPE = {};
CONTENT_TYPE.HTML = "text/html";
CONTENT_TYPE.JS = "application/javascript";
CONTENT_TYPE.PNG = "image/png";
CONTENT_TYPE.JPG = "image/jpg";
CONTENT_TYPE.CSS = "text/css";

/**
 * Component Development Server
 */
const Dev = function (port) {
    this.port = port || 7001;
    this.templates = pkg.app.dev.templates;
    this.js = this.flatten(pkg.app.dev.js.map(this.getSourceFiles));
    this.css = this.flatten(pkg.app.dev.css.map(this.getSourceFiles));
    this.server = null;
    this.start();
};

Dev.prototype = {

    /**
     * Main CLI prompt
     *
     * @method     start
     */
    start: function () {
        var that = this;
        this.server = http
        .createServer(this.handleServerRequests.bind(this))
        .listen(this.port, function() {

            console.log("");
            console.log("");
            console.log(chalk.bgWhite("        "));
            console.log(chalk.black.bgWhite("  app  "), " DEV ");
            console.log(chalk.bgWhite("        "));
            console.log("");
            console.log("");

            console.log("Server:","http://localhost:" + that.port);
            var cmd = 'open http://localhost:'+that.port;
            exec(cmd, function(error, stdout, stderr) {
              // command output is in stdout
            });

            console.log("");
            console.log("");

        });
    },

    /**
     * flatten array of arrays
     */
    flatten: function(arrayOfArrays){
        return [].concat.apply([], arrayOfArrays);
    },

    /**
     * Gets the file set from src in package.json
     *
     * @param      {<type>}  sourceSet  The source set
     */
    getSourceFiles: function(set){
        return pkg.app.src[set];
    },

    /**
     * Handle http requests
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    handleServerRequests: function(req, res) {

        if (req.url === "/") {
            
            var that = this;

            var t1 = fs.readFileSync(this.templates.content, 'utf8');

            // now update the main template
            fs.readFile("./templates/develop.html", 'utf8', function(err, data){
                data = data
                .replace("<!-- HTML:CONTENT -->", t1)
                .replace("<!-- CSS -->", that.wrapInCssLinkTag(that.css))
                .replace("<!-- JS -->", that.wrapInScriptTag(that.js));
                console.log(chalk.gray("Served: "), './');
                res.writeHead(200, { "Content-Type": CONTENT_TYPE.HTML });
                res.write(data);
                res.end();
            });

        // else serve asset
        } else {

            var filePath = '.' + req.url;
            var extname = path.extname(filePath);
            var contentType = this.getContentType(extname);

            fs.readFile(filePath, function(error, content) {
                if (error) {
                    if (error.code == 'ENOENT') {
                        res.writeHead(404);
                        res.end('404');
                        res.end();
                    } else {
                        res.writeHead(500);
                        res.end('500');
                        res.end();
                    }
                } else {
                    console.log(chalk.gray("Served: "), filePath);
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });

        }
    },

    /**
     * Get content type
     * @param  {[type]} extname [description]
     * @return {[type]}         [description]
     */
    getContentType: function(extname){
        var contentType = CONTENT_TYPE.HTML;
        switch (extname) {
            case '.js':
                contentType = CONTENT_TYPE.JS;
                break;
            case '.png':
                contentType = CONTENT_TYPE.PNG;
                break;
            case '.jpg':
                contentType = CONTENT_TYPE.JPG;
                break;
            case '.css':
                contentType = CONTENT_TYPE.CSS;
                break;
        }
        return contentType;
    },

    /**
     * Load script tags
     * @param  {[type]} files [description]
     * @return {[type]}       [description]
     */
    wrapInScriptTag: function(files) {
        var tags = '';
        files.forEach(function(file){
            tags += '<script src="'+file+'"></script>\n';        
        });
        return tags;
    },

    /**
     * Load script tags
     * @param  {[type]} files [description]
     * @return {[type]}       [description]
     */
    wrapInCssLinkTag: function(files) {
        var tags = '';
        files.forEach(function(file){

            tags += '<link rel="stylesheet" type="text/css" href="'+file+'">\n';        
        });
        return tags;
    }

};

var dev = new Dev();
