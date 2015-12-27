'use strict';

exports.list = function(req, res, next) {
    require('drivelist').list(function(err, disks) {
        if (err) { 
            console.err("Failed to fetch drives: " + err);
            next(err);
        } else {
            res.json(disks);
        }
    });
}
