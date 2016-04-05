var express = require( 'express' );
var app = express( );
var server = require( 'http' ).createServer( app );
var io = require( 'socket.io' )( server );
var port = process.env.RECTO_VERSO_PORT || 5000;

var players = [];
var nbPlayersNeededToStart = 2;

server.listen( port, function( ) {
    console.log( 'Server listening at port %d', port );
} );

app.use( express.static( __dirname + '/public' ) );

io.on( 'connection', function( socket ) {
  
	var id = socket.id;
	
  console.log('> New player \b \t  \b \t ID : '+id);
  players.push({'id':id, 'readyToPlay':'false', 'score':0});
  
  socket.emit('newPlayer', {id: socket.id});
  
  console_showPlayersArray();
  
  socket.on('readyToPlay', function(data) {
    for (var i = 0; i < players.length; i++) {
      if (players[i].id == socket.id) {
        players[i].readyToPlay = true;
      }
    }
    
    console_showPlayersArray();
    
    var nbPlayersReady = 0;
    
    for (var i = 0; i < players.length; i++) {
      if (players[i].readyToPlay == true) nbPlayersReady++;
    }
    
    console.log('> '+nbPlayersReady+' player(s) ready to play!');
    
    if (nbPlayersReady == nbPlayersNeededToStart) {
      console.log('> Let\'s start the game!');
      io.sockets.emit('startGame',nbPlayersReady);        
    }
  });
  
  socket.on('foundPair', function (data) {
    console.log('> Found pair! \b \t \b \t ID : '+socket.id, data);
    
    for (var i = 0; i < players.length; i++) {
      /*
       *  On incrémente le score
       *  du joueur concerné
       */
       
      if (players[i].id == socket.id) {
        players[i].score++;
        
      } 
    }
    
    io.sockets.emit('score', players);
    
    console_showPlayersArray();
  });
  
  socket.on('flippedCard', function (data) {
    console.log('> Card flipped \b \t \b \t ID : '+socket.id, data);
    socket.broadcast.emit('flippedCard', data);
  });
  
  socket.on('resetedCard', function (data) {
    console.log('> Card reseted \b \t \b \t ID : '+socket.id, data);
    socket.broadcast.emit('resetedCard', data);
  });
  
  socket.on('foundCard', function (data) {
    console.log('> Card found \b \t \b \t ID : '+socket.id, data);
    socket.broadcast.emit('foundCard', data);
  });
  
  socket.on('disconnect', function() {
    for (var i = 0; i < players.length; i++) {
      if (players[i].id == socket.id) {
        // TODO : envoyer un message aux autres joueurs pour réinitialiser leur jeu (STATE_FORCE_RESTART)
        
        console.log('> Player left \b \t  \b \t ID : '+socket.id+' ('+i+')');
        players.splice(i,1);
        break; 
      }
    }
  });
});

function console_showPlayersArray() {
  console.log('+------------------------------------------------------------------+');
  
  for (var i = 0; i < players.length; i++) {
    console.log('+ '+players[i].id+' \b \t Ready to play: '+players[i].readyToPlay+'  \b \t Score : '+players[i].score+' +');
  }
  
  console.log('+------------------------------------------------------------------+');
  console.log('');
}