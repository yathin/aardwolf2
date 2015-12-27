exports.browse = function(req, res, next) {
    var dir = "public/data";
    if (req.body.dir != undefined) {
        dir = decodeURI(req.body.dir);
    }
    var fs = require("fs");
    var path = require("path");
    var FILETYPE = {
        UNSUPPORTED:   -1,
        AARDWOLF:       0,
        DIR:            1,
        JPEG:           2
    };
    
    // default data directory: aardwolf working path + data dir
    var currentDir = process.cwd();
    if (dir == "") { 
        currentDir = path.join(currentDir, "public/data") 
    } else {
        currentDir = dir;
    }
    
    fs.readdir(currentDir, function(err, files) {
        if (err) {
            console.error("Error reading files: " + err); 
            next(err);
        } else {
            var data = [];
            files.forEach(function(file) {
                try {
                    var fileType = FILETYPE.UNSUPPORTED;
                    if (path.extname(file).toLowerCase() == ".jpg" || path.extname(file).toLowerCase() == ".jpeg")
                        fileType = FILETYPE.JPEG;
                    else if (fs.statSync(path.join(currentDir, file)).isDirectory()) 
                        fileType = FILETYPE.DIR;
                    else if (path.extname(file).toLowerCase() == "aardwolf")
                        fileType = FILETYPE.AARDWOLF;
                    data.push({name: file, type: fileType, path: path.join(currentDir, file)});
                } catch(e) {
                    console.error("Error reading files: " + e); 
                }
            });
            res.json(data);
        }
    });
}
