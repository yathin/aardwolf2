var express     = require('express');
var bodyParser  = require('body-parser');
var path        = require('path');

var app         = express();

app.set('port', process.env.PORT || 7781);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

require('./db').db.init(function(err){});
app.util    = require('util');
app.db      = require('./db').db.db;

app.get     ('/exif',                               require('./routes/exif').fetch); 
app.use     ('/files',                              require('./routes/filebrowser').browse);
app.use     ('/drives',                             require('./routes/drivelist').list);

app.get     ('/camera/list',                        require('./routes/camera').list);
app.post    ('/camera/add',                         require('./routes/camera').add);
app.put     ('/camera/edit',                        require('./routes/camera').edit);

app.post    ('/tag/add',                            require('./routes/tags').add);
app.put     ('/tag/edit',                           require('./routes/tags').edit);
app.delete  ('/tag/remove',                         require('./routes/tags').remove);
app.get     ('/tag/groups/list',                    require('./routes/tags').listGroups);
app.post    ('/tag/groups/add',                     require('./routes/tags').addGroups);
app.delete  ('/tag/groups/remove',                  require('./routes/tags').removeGroups);
app.get     ('/tag/list/:group?',                   require('./routes/tags').list);
app.get     ('/tag/names/list',                     require('./routes/tags').listNames);
app.get     ('/tag/values/list',                    require('./routes/tags').listValues);

app.post    ('/folder/add',                         require('./routes/folder').add);
app.post    ('/folder/create',                      require('./routes/folder').create);
app.get     ('/folder/list/:cameraID',              require('./routes/folder').list);

app.get     ('/journal/fetch/:id',                  require('./routes/journal').fetch); 
app.post    ('/journal/add',                        require('./routes/journal').add);
app.put     ('/journal/log/:id',                    require('./routes/journal').log);
app.get     ('/journal/search',                     require('./routes/journal').search);

app.get     ('/photo/count',                        require('./routes/photo').count);
app.get     ('/photo/list/:start?/:count?',         require('./routes/photo').list);
app.post    ('/photo/:photoID/tag/upsert/:tagID?',  require('./routes/photo').tag);
app.delete  ('/photo/:photoID/tag/remove/:tagID?',  require('./routes/photo').untag);
app.get     ('/photo/:photoID/tag/list',            require('./routes/photo').listTags);

app.get     ('/data/view',                          require('./routes/data').view);
app.get     ('/data/download',                      require('./routes/data').download);

var server = require('http').createServer(app);

/** **IMPORTANT** this app is designed to only serve local requests **/
server.listen(app.get('port'), 'localhost');
server.on('listening', function(){
    var port = server.address().port;
    console.log("Aardwolf is ready!");
    console.log("Please paste the following URL into your favorite web browser: http://localhost:" + port); 
});

app.use(express.static(path.join(__dirname, 'public')));

// Error handlers
app.use(function(err, req, res, next) {
  console.log(err.stack);
  res.status(500);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({error: 'Internal server error', info: err.stack}));
});


process.on('uncaughtException', function (error) {
   console.log(error.stack);
});
