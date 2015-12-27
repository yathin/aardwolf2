'use strict';

exports.fetch = function(req, res, next) { 
    var file = req.query.file;
    if (file == null) {
        res.sendStatus(400);
    } else { 
        var filePath    = require('path').join("public", file);
        var fse         = require('fs-extra');
        var dateFormat  = require('dateformat');
        var exif        = require('exiftool');
        
        // Read EXIF and then copy file to Aardwolf locations
        fse.readFile(filePath, function (err, data) {
            if (err) {
                console.error("Cound not read src file: " + filePath);
                next(err);
            } else {
                exif.metadata(data, function (err, metadata) {
                    if (err) {
                        console.error("Failed to get EXIF for file: " + filePath);
                        next(err);
                    } else {
                        var kvPairs = [];
                        for (var key in metadata) { 
                            var obj = new Object;
                            obj.key = key;
                            obj.value = metadata[key];
                            kvPairs.push(obj);
                        }
                        res.json({"data": kvPairs});
                    }
                });
            }
        });
    }
}
