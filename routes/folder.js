'use strict';

exports.create = function(req, res, next) { 
    var dateFormat  = require('dateformat');
    var fse         = require('fs-extra');
    var path        = require('path');

    var now         = new Date();
    var folderName  = dateFormat(now, "yyyyddmm_HHMMss");
    var cameraID    = req.body.camera_id;
    var cameraName  = req.body.camera_name;
    
    if (cameraID == undefined || cameraName == undefined) { 
        console.error("Undefined camera attributes. Camera name: " + cameraName + ", camera id: " + cameraID);
        res.sendStatus(400);
    } else {
        var folderPath              = path.join(path.join("public/data/", cameraName), folderName);
        var folderPathForResized    = path.join(folderPath, "resized");
        var folderPathForThumbnails = path.join(folderPath, "thumb");
        fse.mkdirsSync(folderPath);
        fse.mkdirsSync(folderPathForResized);
        fse.mkdirsSync(folderPathForThumbnails);

        req.app.db.run("INSERT INTO folder(camera_id, name) VALUES ($camera_id, $name)", 
                {"$camera_id":cameraID, "$name":folderName},
                function(err) { 
                    if (err != null) {
                        console.error("Creating folder failed. CameraID: " + cameraID + ", folder: " + folderName);
                        next(err);
                    } else { 
                        res.json({"id":this.lastID, "name":folderName});
                    }
                });
    }
}

exports.list = function(req, res, next) { 
    if (req.params.cameraID == null) { 
        res.sendStatus(400);
    } else { 
        req.app.db.all("SELECT * FROM folder WHERE camera_id=$camera_id", 
                {"$camera_id":req.params.cameraID},
                function(err, rows) { 
                    if (err) { 
                        console.error("Failed to get folders: " + err);
                        next(err);
                    } else { 
                        res.json({data: rows});
                    }
                });
    }
}

exports.add = function(req, res, next) { 
    var dateFormat  = require('dateformat');
    var exif        = require('exiftool');
    var fse         = require('fs-extra');
    var gm          = require('gm');
    var path        = require('path');

    var cameraID        = req.body.camera_id;
    var folderID        = req.body.folder_id;
    var cameraName      = req.body.camera_name;
    var folderName      = req.body.folder_name;
    var filePath        = req.body.file;
    var baseDir         = path.join(path.join("public/data", cameraName), folderName);
    var fileName        = path.basename(filePath);
    var originalCopy    = path.join(baseDir, fileName);
    var resizedCopy     = path.join(path.join(baseDir, "resized"), fileName);
    var thumbCopy       = path.join(path.join(baseDir, "thumb"), fileName);

    var now = new Date();
    var createDate = dateFormat(now, "isoDateTime");
 
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
                    if (metadata.createDate != undefined)
                        createDate = metadata.createDate;
                    else if (metadata["date/timeOriginal"] != undefined)
                        createDate = metadata['date/timeOriginal'];
                    else if (metadata["date/timeCreated"] != undefined)
                        createDate = metadata['date/timeCreated'];

                    // We make three copies of the file: 
                    //   1. Original
                    //   2. Resized (Max 1000px)
                    //   3. Thumbnail (Max 300px)
                    fse.copy(filePath, originalCopy, function(err){
                        if (!err) {
                            gm(filePath).resize('1000', '1000', '^').write(resizedCopy, function(err) { 
                                if (!err) { 
                                    gm(filePath).resize('300', '300', '^').write(thumbCopy, function(err) { 
                                        if (!err) { 
                                            // Now that we have copied files, write to Database
                                            req.app.db.run("INSERT INTO photo(folder_id, name, created_on) VALUES ($folder_id, $name, $created)",
                                                    {"$folder_id": folderID, "$name":fileName, "$created":createDate},
                                                    function(err) { 
                                                        if (!err) {
                                                            res.sendStatus(200);
                                                        } else { 
                                                            // Failed! Cleanup files
                                                            console.error("Failed to write photo data: " + err);
                                                            fse.removeSync(resizedCopy);
                                                            fse.removeSync(originalCopy);
                                                            fse.removeSync(thumbCopy);
                                                            next(err);
                                                        }
                                                    });

                                        } else { 
                                            console.error("Failed to copy " + fileName + " -> " + thumbCopy + err);
                                            fse.removeSync(resizedCopy);
                                            fse.removeSync(originalCopy);
                                            next(err);
                                        }
                                    });
                                } else { 
                                    console.error("Failed to copy " + fileName + " -> " + resizedCopy + err);
                                    fse.removeSync(originalCopy);
                                    next(err);
                                }
                            });
                        } else { 
                            console.error("Failed to copy " + fileName + " -> " + originalCopy + err);
                            next(err);
                        }
                    });
                }
            });
        }
    });
}
