const pkg = require('../package');
const fs = require('fs-extra')

var Deploy = function(){
    this.css = this.concatFiles(pkg.video.deploy.css);
    this.js = this.concatFiles(pkg.video.deploy.js);
    this.deploy();
};

Deploy.prototype = {
    deploy: function(){
        fs.emptyDirSync('./build');
        fs.outputFileSync('./build/js/app.js', this.js);
        fs.outputFileSync('./build/css/app.css', this.css);
    },
    concatFiles: function(fileList){
        return fileList.map(function(file){
            return fs.readFileSync(file, 'utf-8');
        }).join('\n');
    }
};

var deploy = new Deploy();