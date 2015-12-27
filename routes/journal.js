'use strict';

exports.fetch = function(req, res, next) { 
    req.app.db.all("SELECT * FROM journal WHERE id = $id", 
            {"$id":req.params.id},
            function(err, rows) { 
                if (err) { 
                    console.error("Could not fetch journal: " + err);
                    next(err);
                } else { 
                    if (rows.length > 0) 
                        res.json(rows[0]);
                    else
                        res.json({});
                }
                    
            });
}

exports.log = function(req, res, next) { 
    var journal = req.body.journal;
    req.app.db.run("UPDATE journal SET page_size=$page_size, page=$page, page_index=$page_index, tag=$tag, updated_on=datetime('now') WHERE id=$id",
            {"$id":req.params.id,"$page_size":journal.page_size, "$page":journal.page, "$page_index":journal.page_index, "$tag":journal.tag},
            function(err){
                if (err) { 
                    console.error("Failed to update journal: " + err);
                    next(err);
                } else {
                    res.sendStatus(200);
                }
            });
}

exports.search = function(req, res, next) { 
    var tag         = (req.query.tag)        ? req.query.tag : "";
    var cameraID    = (req.query.camera_id)  ? req.query.camera_id : 0;
    var folderID    = (req.query.folder_id)  ? req.query.folder_id : 0;
    var search      = (req.query.search_query) ? req.query.search_query : "";

    var query = "SELECT * FROM journal WHERE tag=$tag AND camera_id=$camera_id AND folder_id=$folder_id AND search_query=$search_query ORDER BY updated_on DESC LIMIT 1";
    var fields = {"$tag":tag, "$camera_id":cameraID, "$folder_id":folderID, "$search_query":search};

    // if all fields are default then fetch the latest
    if (!Object.keys(req.query).length) {
        query = "SELECT * FROM journal ORDER BY updated_on DESC LIMIT 1";
        fields = {};
    }
    req.app.db.all(query, fields,
            function(err, rows) { 
                if (err) { 
                    console.error("Failed to search journal: " + err);
                    next(err);
                } else { 
                    if (rows.length > 0) { 
                        res.json(rows[0]);
                    } else {
                        res.json({});
                    }
                }
            });
}

exports.add = function(req, res, next) { 
    var pageSize    = (req.body.page_size)  ? req.body.page_size : 100;
    var page        = (req.body.page)       ? req.body.page : 1;
    var pageIndex   = (req.body.page_index) ? req.body.page_index : 0;
    var tag         = (req.body.tag)        ? req.body.tag : "";
    var cameraID    = (req.body.camera_id)  ? req.body.camera_id : 0;
    var folderID    = (req.body.folder_id)  ? req.body.folder_id : 0;
    var search      = (req.body.search_query) ? req.body.search_query : "";

    req.app.db.run("INSERT INTO journal(page_size, page, page_index, tag, camera_id, folder_id, search_query) VALUES ($page_size, $page, $page_index, $tag, $camera_id, $folder_id, $search_query)",
            {"$page_size": pageSize, "$page":page, "$page_index":pageIndex, "$tag":tag, "$camera_id":cameraID, "$folder_id":folderID, "$search_query":search},
            function(err) { 
                if (err) { 
                    console.error("Failed to add to journal: " + err);
                    next(err);
                } else { 
                    var id = this.lastID;
                    req.app.db.all("SELECT * FROM journal WHERE id = $id", 
                            {"$id":id},
                            function (err, rows) { 
                                if (err) { 
                                    console.error("Failed to fetch journal: " + err);
                                    next(err);
                                } else { 
                                    if (rows.length > 0)
                                        res.json(rows[0]);
                                    else
                                        res.json({"id":id});
                                }
                            });
                }
            });
}
