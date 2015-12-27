'use strict';

exports.listGroups = function(req, res, next) {
    req.app.db.all("SELECT name FROM tag_group", 
            function(err, rows) { 
                if (err) {
                    console.error("Failed to fetch tag groups: " + err);
                    next(err);
                } else {
                    res.json({"data": rows});
                }
            });
}

exports.addGroups = function(req, res, next) {
    if (!Object.keys(req.body).length || req.body.$name == null) {
        console.error("Bad request: No tag group name");
        res.sendStatus(400);
    } else { 
        req.app.db.run("INSERT INTO tag_group VALUES($name)", 
            req.body,
            function(err){
                if (err) {
                    console.error("Failed to add tag group: " + err);
                    next(err);
                } else { 
                    res.sendStatus(200);
                }
        });
    }
}

exports.removeGroups =  function(req, res, next) {
    if (!Object.keys(req.body).length || req.body.$name == null) {
        console.error("Bad request: No tag group name");
        res.sendStatus(400);
    } else { 
        req.app.db.run("DELETE FROM tag_group WHERE name=$name", 
            req.body,
            function(err){
                if (err) { 
                    console.error("Failed to remove Tag Group: " + err);
                    next(err);
                } else { 
                    res.sendStatus(200);
                }
        });
    }
}

exports.listValues = function(req, res, next) {
    req.app.db.all("SELECT name FROM tag_value_type ORDER BY name ASC", 
            function(err, rows) { 
                if (err) { 
                    console.error("Failed to fetch tag value types: " + err);
                    next(err);
                } else { 
                    res.json({"data": rows});
                }
            });
}

exports.listNames = function(req, res, next) { 
    req.app.db.all("SELECT DISTINCT name AS label, name AS value FROM tag_definition ORDER BY name ASC",
            function(err, rows) { 
                if (err) { 
                    console.err("Failed to fetch tag names: " + err);
                    next(err);
                } else { 
                    res.json(rows);
                }
            });
}

exports.list = function(req, res, next) {
    if (!req.params.group) { 
        req.app.db.all("SELECT group_name,name,value_type,shortcut,xmp_name,created_on FROM tag_definition ORDER BY group_name ASC, value_type ASC, name ASC",
            function(err, rows) {
                if (err) { 
                    console.error("Failed getting list of tags: " + err);
                    next(err);
                } else {
                    res.json({"data": rows});
                }
            });
    } else { 
        req.app.db.all("SELECT group_name,name,value_type,shortcut,xmp_name,created_on FROM tag_definition WHERE group_name=$group ORDER BY group_name ASC, value_type ASC, name ASC",
            {"$group": req.params.group},
            function(err, rows) {
                if (err) { 
                    console.error("Failed getting list of tags: " + err);
                    next(err);
                } else {
                    res.json({"data": rows});
                }
            });
    }
}

exports.add = function(req, res, next) { 
    console.log("Adding tag: " + req.app.util.inspect(req.body, false, null));
    req.app.db.run("INSERT INTO tag_definition(group_name,name,value_type,shortcut,xmp_name) VALUES ($group_name,$name,$value_type,$shortcut,$xmp_name)", 
            req.body,
            function(err){
                if (err) { 
                    console.error("Adding tag failed. Err: " + err);
                    next(err);
                } else { 
                    res.sendStatus(200);
                }
            });
}

exports.edit = function(req, res, next) { 
    console.log("Editing tag: " + req.app.util.inspect(req.body, false, null));
    req.app.db.run("UPDATE tag_definition SET value_type=$value_type, shortcut=$shortcut WHERE group_name=$group_name AND name=$name", 
            req.body,
            function(err){
                if (err) { 
                    console.error("Editing tag failed. Err: " + err);
                    next(err);
                } else { 
                    res.sendStatus(200);
                }
            });
}

exports.remove = function(req, res, next) { 
    console.log("Removing tag: " + req.app.util.inspect(req.body, false, null));
    req.app.db.run("DELETE FROM tag_definition WHERE group_name=$group_name AND name=$name", 
            req.body,
            function(err){
                if (err) { 
                    console.error("Deleting tag failed. Err: " + err);
                    next(err);
                } else { 
                    res.sendStatus(200);
                }
            });
}
