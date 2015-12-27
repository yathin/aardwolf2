'use strict';

function getData(count, inCSV, req, res, next) {
    req.app.db.all("SELECT group_name, name FROM tag_definition ORDER BY group_name ASC, name ASC",
            function(err, rows) { 
                if (err) { 
                    console.error("Failed to read tag definitions: " + err);
                    next(err);
                } else {
                    var cases = [];
                    for (var i = 0; i < rows.length; i++) { 
                        var row = rows[i];
                        var query = " MAX(CASE WHEN t.group_name = '" + row.group_name +  "' AND t.name='" + row.name + "' THEN t.value ELSE '' END) AS '" + row.group_name + "_" + row.name + "'";
                        cases.push(query);
                    }
                    var tag_query = cases.join(",");
                    var query = "SELECT p.id AS photo_id, c.name AS camera_name, f.name AS folder_name, p.name AS photo_name, p.created_on AS photo_time ";
                    if (tag_query.length > 10) {
                        query += ", " + tag_query + " ";
                    }
                    query += " FROM camera c LEFT JOIN folder f ON c.id = f.camera_id LEFT JOIN photo p ON p.folder_id = f.id LEFT JOIN tag t ON t.photo_id = p.id GROUP BY t.photo_id HAVING t.photo_id IS NOT NULL ";
                    if (count) {
                        query += " LIMIT " + count;
                    }
                    req.app.db.all(query,
                            function(err, rows) {
                                if (err) { 
                                    console.error("Failed to get data: " + err);
                                    next(err);
                                } else {
                                    if (inCSV) {
                                        if (rows.length < 1) { 
                                            res.send("");
                                        } else {
                                            var json2csv = require('json2csv');
                                            var fields = Object.keys(rows[0]);
                                            json2csv({"data":rows, "fields":fields}, function(err, csv) {
                                                if (err) {
                                                    next(err);
                                                } else {
                                                    res.format({
                                                        "text/plain": function() {
                                                            res.send(csv);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        res.json({"data":rows});
                                    }
                                }
                            });
                }
            });
}

exports.view = function(req, res, next) { 
    getData(1000, false, req, res, next);
}

exports.download = function(req, res, next) { 
    getData(0, true, req, res, next);
}
