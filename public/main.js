$( function() {
	var body = document.querySelector('body');
	body.style.height = window.innerHeight + 'px';

    var socket = io();
    socket.emit( 'join', ~~(Math.random()*10) );


    socket.on( 'new click', function( data ) {
        console.log('new click', data );
    } );

	body.addEventListener('click', function(e){
		console.log('click', { x:e.clientX, y:e.clientY } );
		socket.emit('click', { x:e.clientX, y:e.clientY } );
	});
} );