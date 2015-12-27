'use strict';

exports.count =  function(req, res, next) { 
    var tag         = (req.query.tag)        ? req.query.tag : "";
    var cameraID    = (req.query.camera_id)  ? req.query.camera_id : 0;
    var folderID    = (req.query.folder_id)  ? req.query.folder_id : 0;
    var search      = (req.query.search_query) ? req.query.search_query : "";

    var query = "SELECT count(p.id) AS num_photos FROM photo p LEFT JOIN folder f ON p.folder_id = f.id LEFT JOIN camera c ON c.id = f.camera_id ";
    if (tag != "") {
        query += " LEFT JOIN tag t ON t.photo_id = p.id WHERE t.name = '" + tag + "'";
    }
    if (cameraID != 0) { 
        if (tag == "") {
            query += " WHERE ";
        } else {
            query += " AND ";
        }
        query += " c.id = " + cameraID;
        if (folderID != 0) { 
            query += " AND f.id = " + folderID;
        }
    }

    req.app.db.all(query, 
            function(err, rows){
                if (err) { 
                    console.error("Error counting rows: " + err);
                    next(err);
                } else {
                    var num_photos = rows[0].num_photos;
                    res.json({"num_photos": num_photos});
                }
            });
}

exports.list = function(req, res, next) { 
    // Photo filters if any
    var cameraID    = (req.query.camera_id) ? req.query.camera_id : 0;
    var folderID    = (req.query.folder_id) ? req.query.folder_id : 0;
    var tag         = (req.query.tag) ? req.query.tag : ""; 
    var search      = req.query.search;  // TODO:

    /** Galleria expects output in the following format
        var data = [
        {
            image: 'img1.jpg',
            thumb: 'thumb1.jpg',
            big: 'big1.jpg',
            title: 'my first image',
            description: 'Lorem ipsum caption',
            link: 'http://domain.com'
        },
        {
            video: 'http://www.youtube.com/watch?v=GCZrz8siv4Q',
            title: 'my second image',
            description: 'Another caption'
        }
        ];
     */
    var query = "SELECT " +
                    "   p.id AS photo_id, " +
                    "   p.folder_id AS folder_id, " +
                    "   p.name AS photo_name, " +
                    "   p.created_on AS photo_create_time, " +
                    "   (\"data/\" || c.name || \"/\" || f.name || \"/resized/\" || p.name) AS image, " +
                    "   (\"data/\" || c.name || \"/\" || f.name || \"/resized/\" || p.name) AS big, " +
                    "   (\"data/\" || c.name || \"/\" || f.name || \"/thumb/\" || p.name) AS thumb, " +
                    "   (\"data/\" || c.name || \"/\" || f.name || \"/\" || p.name) AS original, " +
                    "   c.id    AS camera_id, " +
                    "   c.name  AS camera_name, " +
                    "   f.id    AS folder_id, " +
                    "   f.name  AS folder_name " +
                    "   FROM photo p LEFT JOIN folder f ON f.id = p.folder_id LEFT JOIN camera c ON c.id = f.camera_id "
    if (tag != "") {
        query += " LEFT JOIN tag t ON t.photo_id = p.id WHERE t.name = '" + tag + "'";
    }
    if (cameraID != 0) { 
        if (tag == "") {
            query += " WHERE ";
        } else {
            query += " AND ";
        }
        query +=    "   c.id = " + cameraID + " ";
        if (folderID != 0) {
            query +=    "   AND f.id = " + folderID + " ";
        }
    }
                    
    query +=        " ORDER BY p.id ASC ";   // Order
    query += ((req.params.start && req.params.count) 
                ? (" LIMIT " + req.params.start + ", " + req.params.count) 
                : (" LIMIT 0, 200 ") );

    req.app.db.all(query,
            function(err, rows){
                if (err) { 
                    console.error("Error fetching photos: " + err);
                    next(err);
                } else {
                    res.json({"data": rows});
                }
            });
}


exports.tag = function(req, res, next) {
    var photoID     = req.params.photoID;
    var tagID       = req.params.tagID;
    var groupName   = req.body.group;
    var tagName     = req.body.tag;
    var value       = req.body.value;
    if (groupName == null || tagName == null || value == null || isNaN(parseInt(photoID))) { 
        res.sendStatus(400);
    } else {
        if (!tagID) { 
            // Insert
            req.app.db.run("INSERT INTO tag(photo_id, group_name, name, value) VALUES ($photo_id, $group_name, $name, $value)",
                    {"$photo_id":photoID, "$group_name":groupName, "$name":tagName, "$value":value }, 
                    function(err) { 
                        if (err) { 
                            console.error("Failed to insert tag: " + err);
                            next(err);
                        } else {
                            res.json({"id":this.lastID, "value":value});
                        }
                    });
        } else { 
            // Update
            req.app.db.run("UPDATE tag SET value=$value WHERE id=$id",
                    {"$id":tagID,"$value":value},
                    function(err) { 
                        if (err) {
                            console.error("Failed to update tag(" + tagID + "): " + err);
                            next(err);
                        } else { 
                            res.json({"id":tagID,"value":value});
                        }
            });
        }
    }
}

exports.untag = function(req, res, next) {
    var photoID = req.params.photoID;
    var tagID   = req.params.tagID;
    if (isNaN(parseInt(photoID)) || isNaN(parseInt(tagID))) { 
        res.sendStatus(400);
    } else {
        req.app.db.run("DELETE FROM tag WHERE id=$id",
            {"$id":tagID},
            function(err) { 
                if (err) {
                    console.error("Failed to remove tag(" + tagID + "): " + err);
                    next(err);
                } else { 
                    res.sendStatus(200);
                }
        });
    }
}

exports.listTags = function(req, res, next) { 
    req.app.db.all('SELECT * FROM tag WHERE photo_id=$photo_id', 
            {"$photo_id":req.params.photoID},
            function(err, rows){
                if (err) { 
                    console.err("Error fetching tags for photo: " + err);
                    next(err);
                } else { 
                    res.json({"data":rows});
                }
            });
}
