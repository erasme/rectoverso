$( function() {
	var body = document.querySelector('body');
	body.style.height = window.innerHeight + 'px';

    var socket = io();
    socket.emit( 'join', ~~(Math.random()*10) );

		socket.emit('getInstagramPhotos');

		socket.on('receiveInstagramPhotos', function(pics){
			for (var i = 0; i < pics.length; i++) {
				var url = pics[i].images.standard_resolution.url;
				var w = pics[i].images.standard_resolution.width;
				var h = pics[i].images.standard_resolution.height;

				// check if the pic is square
				if (w == h) {
					var img = "<img src="+url+"width="+w+"height="+h+"/>";
					console.log(img);
					$("#gallery").append(img)
				}
			}
		})


    socket.on( 'new click', function( data ) {
        console.log('new click', data );
    } );

	body.addEventListener('click', function(e){
		console.log('click', { x:e.clientX, y:e.clientY } );
		socket.emit('click', { x:e.clientX, y:e.clientY } );
	});
} );
