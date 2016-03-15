var express = require( 'express' );
var app = express( );
var server = require( 'http' ).createServer( app );
var io = require( 'socket.io' )( server );
var port = process.env.PORT || 3000;

var config = require("./config");

// instagram
var api = require('instagram-node').instagram();

// log instagram
// console.log(config.instagram.client_id,config.instagram.client_secret);
api.use({ 'access_token' : config.instagram.access_token });

/*
SEARCH Media in Instagram
OPTIONS: { [min_timestamp], [max_timestamp], [distance] };
*/
//
exports.get_images = function(req, res) {

  var options = [];

  console.log(config.location.lat, config.location.lng);

  api.media_search( config.location.lat, config.location.lng, options, function(err, medias, remaining, limit) {
    if (err) {
      res.sendStatus(403);
      res.send(err.body);
    } else {
      
      console.log("API limit: " , remaining, "/", limit);
      res.send(medias);
    }
  });
};

// This is where you would initially send users to authorize
app.get('/get_images', exports.get_images);


server.listen( port, function( ) {
    console.log( 'Server listening at port %d', port );
} );

app.use( express.static( __dirname + '/public' ) );

io.on( 'connection', function( socket ) {

    socket.on( 'click', function( data ) {
    	console.log('click', data);
        socket.broadcast.emit( 'new click', data );
    } );

    // when the user disconnects.. perform this
    socket.on( 'disconnect', function( ) {
    } );
} );
