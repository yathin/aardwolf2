'use strict';

exports.list = function(req, res, next) { 
    req.app.db.all("SELECT id, name, desc_name, latitude, longitude, altitude, orientation, info, created_on FROM camera",
            function(err, rows) {
                if (err) { 
                    console.error("Failed getting list of cameras: " + err);
                    next(err);
                } else {
                    res.json({"data": rows});
                }
            });
}

exports.add = function(req, res, next) { 
    console.log("Adding camera: " + req.app.util.inspect(req.body, false, null));
    req.app.db.run("BEGIN TRANSACTION");
    req.app.db.run("INSERT INTO camera(project_id, name, desc_name, latitude, longitude, altitude, orientation, info) "
            + " VALUES ($project_id, $name, $desc_name, $latitude, $longitude, $altitude, $orientation, $info)", 
            req.body,
            function(err) {
                if (err) { 
                    console.error("Adding camera failed: " + err);  
                    console.error("Camera Data: " + req.app.util.inspect(req.body, false, null));
                    next(err);
                } else { 
                    var path        = require('path');
                    var fse         = require('fs-extra');
                    var newFolder   = path.join("public/data/", req.body.$name);
                    fse.ensureDir(newFolder, function(err){
                        if (err) { 
                            console.error("Failed to add camera folder: " + err);
                            req.app.db.run("ROLLBACK");
                            next(err);
                        } else {
                            req.app.db.run("COMMIT");
                            res.sendStatus(200);
                        }
                    });
                }
            });
}

exports.edit = function(req, res, next) { 
    console.log("Editing camera: " + req.app.util.inspect(req.body, false, null));
    req.app.db.all("SELECT * FROM camera WHERE id=$id", 
            {"$id":req.body.$id},
            function(err, rows) { 
                if (err) {
                    next(err);
                } else {
                        console.error(req.app.util.inspect(rows));
                    var camera = null;
                    if (rows.length > 0) { 
                        camera = rows[0];
                    }
                    req.app.db.run("BEGIN TRANSACTION");
                    req.app.db.run("UPDATE camera SET name=$name,desc_name=$desc_name,latitude=$latitude,longitude=$longitude,altitude=$altitude,"
                                + "orientation=$orientation,info=$info,updated_on=CURRENT_TIMESTAMP WHERE id=$id AND project_id=$project_id", 
                                req.body,
                                function(err) {
                                    if (err) { 
                                        console.error("Editing camera failed: " + err); 
                                        console.error("Camera Data: " + req.app.util.inspect(req.body, false, null));
                                        req.app.db.run("ROLLBACK");
                                        next(err);
                                    } else { 
                                        if (req.body.$name != camera.name) {
                                            var path        = require('path');
                                            var fse         = require('fs-extra');
                                            var oldFolder = path.join("public/data/", camera.name);
                                            var newFolder = path.join("public/data/", req.body.$name);
                                            fse.rename(oldFolder, newFolder, function(err) {
                                                if (err) { 
                                                    console.error("Failed renaming folders: " + err);
                                                    req.app.db.run("ROLLBACK");
                                                    next(err);
                                                } else {
                                                    req.app.db.run("COMMIT");
                                                    res.sendStatus(200);
                                                }
                                            });
                                        }
                                    }
                    });
                }
            });
}
