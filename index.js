var CONFIG              = require('./config.js');
var express             = require('express');
var app                 = express();
var server              = require('http').createServer(app);
var io                  = require('socket.io')(server);
var url                 = require('url');
var fs                  = require('fs');
var path                = require('path');
var yaml                = require('js-yaml');
var port                = CONFIG.settings.port || 5000;

var defaultRoomFolder       = CONFIG.cards.defaultRoomFolderName || 'default';
var defaultCardsFolder       = CONFIG.cards.defaultCardsFolderName || 'default';
var rooms               = {};

var rectoverso = null;

try {
  var doc = yaml.safeLoad(fs.readFileSync(CONFIG.settings.path+'/public/'+defaultRoomFolder+'/cards/default/settings.txt', 'utf8'));
  console.log(doc);
} catch (e) {
  console.log(e);
}

function scanApp() {
  directoryTreeToObj(CONFIG.settings.path+'/public/', function(err, res){
    if(err)
        console.error(err);

  //  console.log(JSON.stringify(res, null, 2));

    rectoverso = res.public;
    
  //  console.log(rectoverso);
  });
}

scanApp();

/*
function getFallbackUrl(params) {
  console.log(rectoverso);
  console.log(params);
  
}

console.log(getFallbackUrl({ room : 'abcdef', cards: 'oui' }));
*/

////////////////////////////
//
//  Checking default folder

fs.access( CONFIG.settings.path+'/public/'+defaultRoomFolder, fs.F_OK, function(err) {
  if (!err) {
    
    ////////////////////////////
    //
    //  Folder exists
    
    fs.access(CONFIG.settings.path+'/public/'+defaultRoomFolder+'/cards', fs.F_OK, function(err) {
      if (!err) {
    
        ////////////////////////////
        //
        //  Folder/cards exists
      } else {
        stopServer('ERROR : Cards folder of default folder does not exists, therefore no card can be displayed ; please create `cards` folder inside `'+defaultRoomFolder+'` folder.');
      }
    });
  } else {
    stopServer('ERROR : Default folder does not exists ; please create `'+defaultRoomFolder+'` folder.');
  }
});



server.listen( port, function( ) {
  console.log( 'Server listening at port %d', port );
});

app.set( 'view engine', 'ejs' );
app.use( express.static( CONFIG.settings.path + '/public' ) );

app.get( '/api/getDirectories/:room/:folder' , function(req, res){
  var room = req.params.room || defaultRoomFolder;
  var cardsFolder = req.params.folder || defaultCardsFolder;
  var r = null;
  
  // Does the room folder exists?
  
  fs.access(CONFIG.settings.path+'/public/'+room+'/', fs.F_OK, function(err) {
    if (!err) {
      
      // The room folder exists
      // Does the cards folder exists in this room?
      
      fs.access(CONFIG.settings.path+'/public/'+room+'/cards/'+cardsFolder, fs.F_OK, function(err) {
        if (!err) {
          
          // The room folder exists
          // The cards folder exists in this room
          
          r = JSON.stringify(getTreeInCardsFolder( CONFIG.settings.path + '/public/'+room+'/cards/'+cardsFolder, room, cardsFolder));
  
          console.log(r);
          
          res.type('text/plain');
          res.setHeader('Content-Type', 'application/json');
          res.send(r);
        } else {
          
          // The room folder exists
          // The cards folder does not exist in this room
          // Does the cards folder exists in default folder?
          
          fs.access(CONFIG.settings.path+'/public/'+defaultRoomFolder+'/cards/'+cardsFolder, fs.F_OK, function(err) {
            if (!err) {
          
            // The room folder exists
            // The cards folder does not exist in this room
            // The cards folder exists in default folder
            
              r = JSON.stringify(getTreeInCardsFolder( CONFIG.settings.path + '/public/'+defaultRoomFolder+'/cards/'+cardsFolder, defaultRoomFolder, cardsFolder));
  
              console.log(r);
              
              res.type('text/plain');
              res.setHeader('Content-Type', 'application/json');
              res.send(r);
            } else {
          
              // The room folder exists
              // The cards folder does not exist in this room
              // The cards folder does not exist in default folder
              
              r = JSON.stringify(getTreeInCardsFolder( CONFIG.settings.path + '/public/'+defaultRoomFolder+'/cards/'+defaultCardsFolder, defaultRoomFolder, defaultCardsFolder));
  
              console.log(r);
              
              res.type('text/plain');
              res.setHeader('Content-Type', 'application/json');
              res.send(r);
            }
          });
        }
      });
      
      
    } else {
      
      // The room folder does not exist
      // Does the cards folder exists anyway in default folder?
      
      fs.access(CONFIG.settings.path+'/public/'+defaultRoomFolder+'/cards/'+cardsFolder, fs.F_OK, function(err) {
        if (!err) {
      
        // The room folder does not exist
        // The cards folder exists in default folder
        
          r = JSON.stringify(getTreeInCardsFolder( CONFIG.settings.path + '/public/'+defaultRoomFolder+'/cards/'+cardsFolder, defaultRoomFolder, cardsFolder));

          console.log(r);
          
          res.type('text/plain');
          res.setHeader('Content-Type', 'application/json');
          res.send(r);
        } else {
      
          // The room folder does not exist
          // The cards folder does not exist in default folder
          
          r = JSON.stringify(getTreeInCardsFolder( CONFIG.settings.path + '/public/'+defaultRoomFolder+'/cards/'+defaultCardsFolder, defaultRoomFolder, defaultCardsFolder));

          console.log(r);
          
          res.type('text/plain');
          res.setHeader('Content-Type', 'application/json');
          res.send(r);
        }
      });
    }
  });
});

app.get( '/assets/:room/*' , function(req, res){
  var room = req.params.room,
      path = req.params[0]; 
  
  fs.access(CONFIG.settings.path+'/public/'+room+'/'+path, fs.F_OK, function(err) {
    if (!err) {
      res.sendFile(path, {root: CONFIG.settings.path+'/public/'+room});
    } else {
      res.sendFile(path, {root: CONFIG.settings.path+'/public/'+defaultRoomFolder});
    }
  });
});

app.get( '/:room' , function(req, res) {
  console.log('===================');
  console.log(JSON.stringify(rectoverso[req.params.room]));
  if (req.params.room != 'favicon.ico') {
    fs.access(CONFIG.settings.path+'/public/'+req.params.room+'/index.ejs', fs.F_OK, function(err) {
      
      if (!err) {
        res.render( CONFIG.settings.path + '/public/'+req.params.room+'/index', {
          CONFIG: CONFIG,
          room: req.params.room,
          dir: JSON.stringify(rectoverso[req.params.room])
        });
        
      } else {
        res.render( CONFIG.settings.path + '/public/'+defaultRoomFolder+'/index', {
          CONFIG: CONFIG,
          room: req.params.room,
          dir: JSON.stringify(rectoverso[defaultRoomFolder])
        });
      }
    });
  }
});

io.on('connection', function( socket ) {
  var room = url.parse(socket.request.headers.referer).path;
	var id = socket.id;
	socket.room = room;
	
  checkRooms();

	var nbPlayersInRoom = 0;
	
  for (var i in rooms[socket.room]) {
    nbPlayersInRoom++;
  }
  
  if (nbPlayersInRoom >= CONFIG.game.nbPlayersMaxPerRoom) {
    
    // TODO : envoyer un ping aux sockets de la room
    // pour voir qui est encore connecté
    
    socket.emit('roomFull',{room: socket.room});
  }
  
  else {
    var player = {
      'id':id, 
      'readyToPlay':'false', 
      'score':0,
      'state':0
    }
    
    if (!rooms[room]) {
      rooms[room] = {};
    }
    
    rooms[room][id] = player;
    
    checkRooms();
    
    console.log('> New player \b \t  \b \t ID : '+id+' \b \t Room : '+room);
    
    socket.join(socket.room);
    
    checkConnectedSocketsInRoom(room);    
    
    socket.emit('newPlayer', {
      id: socket.id
    });
    
    console_showPlayersArray();
    
    socket.on('readyToPlay', function(data) {
      
      socket.broadcast.to(socket.room).emit('readyToPlay',socket.id); 
      
      var nbPlayersReady = 0;
      
      for (var i in rooms[socket.room]) {
        if (rooms[socket.room][i].state == 2) {
          nbPlayersReady++;
        }
      }
      
      console.log('> '+nbPlayersReady+' player(s) ready to play in room '+socket.room+' !');
      
      if (nbPlayersReady == CONFIG.game.nbPlayersMinPerRoom) {
        console.log('> Let\'s start the game!');
        io.in(socket.room).emit('startGame',nbPlayersReady);   
      }
      
      console_showPlayersArray();
    });
    
    socket.on('foundPair', function (data) {
      console.log('> Found pair! \b \t \b \t ID : '+socket.id, data);
      
      rooms[socket.room][socket.id].score++;
      
      io.in(socket.room).emit('score', rooms[socket.room]); 
      
      console_showPlayersArray();
    });
    
    socket.on('flippedCard', function (data) {
      console.log('> Card flipped \b \t \b \t ID : '+socket.id, data);
      socket.broadcast.to(socket.room).emit('flippedCard', data); 
    });
    
    socket.on('resetedCard', function (data) {
      console.log('> Card reseted \b \t \b \t ID : '+socket.id, data);
      socket.broadcast.to(socket.room).emit('resetedCard', data); 
    });
    
    socket.on('foundCard', function (data) {
      console.log('> Card found \b \t \b \t ID : '+socket.id, data);
      socket.broadcast.to(socket.room).emit('foundCard', data); 
    });
    
    
    
    socket.on('changedState', function(data) {
      rooms[socket.room][socket.id].state = data.state;
      console_showPlayersArray();
    });
    
    socket.on('disconnect', function() {
      console.log('Before');
      console.log(rooms);
      delete rooms[socket.room][socket.id];
      console.log('After');
      console.log(rooms);
      
      console.log(socket.id+' has disconnected. Check rooms:');
      
      checkRooms();
      
      console.log('resetGame event sended. Check rooms:');
      
      io.in(socket.room).emit('resetGame', { id: socket.id }); 
      
      checkConnectedSocketsInRoom(socket.room);    
      
      checkRooms();
      socket.disconnect();
      socket = undefined;
    });
  }
  
});


function console_showPlayersArray() {
  console.log('+--------------------------------------------------------------------------------+');
  
  for (var index in rooms) {
    console.log('+ '+index);
    
    for (var i in rooms[index]) {
      console.log('+ \b \t '+i+' \b \t State : '+rooms[index][i].state+'  \b \t Score : '+rooms[index][i].score+' ');
    }
  }
  
  console.log('+--------------------------------------------------------------------------------+');
  console.log('');
}

function checkRooms() {
  for (var index in rooms) {
    if (isEmpty(rooms[index])) {
      delete rooms[index];
    }
  }
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}

function getTreeInCardsFolder(srcpath, treeRoom, treeFolder) {
  var r = {
    'room' : treeRoom,
    'cardsFolder' : treeFolder,
    'folders' : []
  };
  
  var cards = fs.readdirSync(srcpath);
  if (cards != false) {
    for (var file in cards) {
      console.log(cards[file]);
      if (fs.statSync(path.join(srcpath, cards[file])).isDirectory()) {
        var temp_folder = {
          'folder' : cards[file],
          'photos' : []
        };
        
        var cards_folder_in = fs.readdirSync(path.join(srcpath, cards[file]));
        for (var file_in in cards_folder_in) {
          if (!isUnixHiddenPath(cards_folder_in[file_in])) {
            console.log(cards_folder_in[file_in]);
            temp_folder.photos.push(cards_folder_in[file_in]);
          }
        }
        
        r.folders.push(temp_folder);
      }
    }
  }
  
  return r;
}

function directoryTreeToObj(dir, done) {
    var results = {};

    fs.readdir(dir, function(err, list) {
        if (err)
          return done(err);
          
        if (results[path.basename(dir)] == undefined) {
          results[path.basename(dir)] = {};
        }

        var pending = list.length;

        if (!pending) {
          return done(null, {[path.basename(dir)]:results});
        }

        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    directoryTreeToObj(file, function(err, res) {
                      /*
                        results.push({
                            name: path.basename(file),
                            type: 'folder',
                            children: res
                        });
                        */
/*
                        results.push({
                            [path.basename(file)] : res
                        });
*/
                        results[path.basename(dir)][path.basename(file)] = res[path.basename(file)];
                        if (!--pending) {
                          done(null, results);
                        }
                    });
                }
                else {
/*
                    results.push({
                        type: 'file',
                        name: path.basename(file)
                    });
*/
/*
                    results.push({
                      [path.basename(file)] : 'file' //path.basename(file)
                    });
*/
                    if (!isUnixHiddenPath(path.basename(file))) {
                      results[path.basename(dir)][path.basename(file)] = path.basename(file);
                    }
                    if (!--pending) {
                      done(null, results);
                    }
                }
            });
        });
    });
};

function stopServer(msg) {
  console.log(msg);
  process.exit(0);
}

function checkConnectedSocketsInRoom(room) {
  /*
  console.log('==============================');
  console.log('==============================');
  console.log('==============================');
  
  var clients_in_the_room = io.sockets.adapter.rooms[room];
  console.log(clients_in_the_room);
  if (clients_in_the_room != undefined) { 
    for (var clientId in clients_in_the_room.sockets ) {
      console.log('client: %s', clientId); //Seeing is believing 
      var client_socket = io.sockets.connected[clientId];//Do whatever you want with this
      console.log(client_socket.connected);
      console.log('> in room: '+client_socket.room);
    }
  }
  
  console.log('==============================');
  console.log('==============================');
  console.log('==============================');
  */
}


/**
 * Checks whether a path starts with or contains a hidden file or a folder.
 * @param {string} source - The path of the file that needs to be validated.
 * returns {boolean} - `true` if the source is blacklisted and otherwise `false`.
 */
var isUnixHiddenPath = function (path) {
    return (/(^|\/)\.[^\/\.]/g).test(path);
};