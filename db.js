exports.db = {

    aardwolfDB: "./db/aardwolf.db",
    db: null,

    init: function(callback) {
        var path = require("path");
        var fs = require("fs");
        var sqlite3 = require("sqlite3").verbose();
        var self = this;

        try {
            fs.statSync(this.aardwolfDB);
            console.log("Checking Aardwolf db: " + this.aardwolfDB + " ... [ok]");
            self.db = new sqlite3.Database(this.aardwolfDB);
        } catch(e) {
            console.log("Initializing *new* Aardwolf database: " + this.aardwolfDB);
            self.db = new sqlite3.Database(this.aardwolfDB);
            fs.readdir("./sql", function(err, files) {
                if (err) {
                    console.log("Error reading SQL init files - " + err); 
                    throw err;
                }
                files.forEach(function(file) {
                    try {
                        if (path.extname(file).toLowerCase() == ".sql") { 
                            console.log("Reading SQL init file: " + file);
                            var sql = fs.readFileSync(path.join("./sql", file), "utf8");
                            self.db.exec(sql);
                        }
                    } catch(e) {
                        console.log("Error reading files: " + e); 
                        callback(e);
                    }
                });
            });
        }
    },


    cleanup: function() { 
        if (this.db != null) this.db.close();
    }

}
