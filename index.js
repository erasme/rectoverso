var express = require( 'express' );
var app = express( );
var server = require( 'http' ).createServer( app );
var io = require( 'socket.io' )( server );
var port = process.env.RECTO_VERSO_PORT || 5000;
var url = require('url');

var nbPlayersNeededToStart = 2;
var nbPlayersMaxInRoom = 2;

var rooms = {};

server.listen( port, function( ) {
  console.log( 'Server listening at port %d', port );
});


app.use( express.static( __dirname + '/public' ) );

app.get( '/:room', function(req, res) {
  res.sendFile( __dirname + '/public/index.html' );
});


io.on('connection', function( socket ) {
  var room = url.parse(socket.request.headers.referer).path;
	var id = socket.id;
	socket.room = room;
	
	var nbPlayersInRoom = 0;
	
  for (var i in rooms[socket.room]) {
    nbPlayersInRoom++;
  }
  
  if (nbPlayersInRoom >= nbPlayersMaxInRoom) {
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
    
    socket.join(socket.room); // TODO : no more than 2 players
    socket.emit('newPlayer', {id: socket.id});
    
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
      
      if (nbPlayersReady == nbPlayersNeededToStart) {
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
      delete rooms[socket.room][socket.id];
      
      console.log(socket.id+' has disconnected. Check rooms:');
      
      checkRooms();
      
      console.log('resetGame event sended. Check rooms:');
      
      io.in(socket.room).emit('resetGame', { id: socket.id }); 
      
      checkRooms();
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