var totalPairs = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'];
var colors = ["0, 0, 24", "255, 80, 80", "255, 231, 104", "159, 236, 255", "160, 160, 160", "100, 241, 142"];
var color1 = colors[Math.floor(Math.random() * colors.length - 1)];
var color2 = colors[Math.floor(Math.random() * colors.length - 1)];
var pairs = [];
var actives = [];
var randoms = [];
var waitingAdv = true;

function getRandomIndex() {
	var random = Math.round(Math.random()*totalPairs.length);
	if (randoms.indexOf(random) == -1) {
		randoms.push(random);
		return random;
	} else {
		return getRandomIndex();
	}
}

function get9RandomPairs(){
	for(var i=0; i<9; i++){
		var random = getRandomIndex();
		pairs.push(random);
	}
	for(var i=0; i<pairs.length; i++){
		pairs[i] = totalPairs[pairs[i]];
	}
	console.log(pairs);
}

function getBackgroundPic() {
	var randomBg = getRandomIndex();
	console.log(randomBg);
	$('body').css({
		"background" : "url('../data/bg/" + (getRandomIndex() - 1) + ".jpg') no-repeat center fixed",
		"background-size": "cover"
	});
	$('#inactive').css({
		"background" : "url('../data/bg/" + (getRandomIndex() - 1) + ".jpg') no-repeat center fixed",
		"background-size": "cover"	
	});
	$('#rules').css({
		"background" : "url('../data/bg/" + (getRandomIndex() - 1) + ".jpg') no-repeat center fixed",
		"background-size": "cover"	
	});
	$('#waiting').css({
		"background" : "url('../data/bg/" + (getRandomIndex() - 1) + ".jpg') no-repeat center fixed",
		"background-size": "cover"	
	});
	$('.colorBg').css("background", "rgba(" + color1 + ",0.4");

}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

$(document).ready(function(){
	var socket = io();
	socket.emit( 'join', ~~(Math.random()*10) );
	socket.on( 'new click', function( data ) {
	    console.log('new click', data.id );
	    $(".card[data-order="+data.id+"]").toggleClass("visibleByOther");
	} );

	socket.on( 'foundByOther', function( data ) {
	    console.log('foundByOther', data.id );
	    $(".card[data-order="+data.id+"]").addClass("foundByOther");
	} );

	socket.on( 'foundByOther', function( data ) {
		$("#foundByOtherScore").html( "<strong>" + $(".foundByOther").length / 2 + "</strong> Adversaire" );
	} );

	socket.on( 'found', function( data ) {
		$("#foundScore").html( "Vous <strong>" + $(".found").length / 2 + "</strong>" );
	} );

	$('body').css("color", "rgb("+ color2 +")");
	$('path').css("fill", "rgb("+ color2 +")");

	getBackgroundPic();

	get9RandomPairs();

	$('#inactive').on('click', function(){
		$(this).css("visibility", "hidden");
		$('#rules').css("visibility", "visible");
	});

	$('#rules').on('click', function(){
		$(this).css("visibility", "hidden");
		if( waitingAdv ) $('#waiting').css("visibility", "visible");
		socket.emit( 'foundOpponent', null );
	});

	socket.on( 'foundOpponent', function() {
		waitingAdv = false;
		$('#waiting').css("visibility", "hidden");
	});

	//création des cartes
	for(var i = 0; i < pairs.length; i++){
		// On crée les cartes qui vont accueillir la première image de chaque paire
		var card0 = document.createElement('div');
		card0.className += 'card';
		card0.className += ' hidden';
		card0.id = 'card0' + pairs[i];
		$('#container').append(card0);

		// On insère chaque première image dans les cartes
		var img0 = document.createElement('img');
		img0.id = 'img0' + pairs[i];
		$('#card0' + pairs[i]).append(img0);
		$('#img0' + pairs[i]).attr({
			'src':"../data/" + pairs[i] + "/0.jpg"
		});

		// On crée les cartes qui vont accueillir la deuxième image de chaque paire
		var card1 = document.createElement('div');
		card1.className += 'card';
		card1.className += ' hidden';
		card1.id = 'card1' + pairs[i];
		$('#container').append(card1);

		// On insère chaque deuxième image dans les cartes
		var img1 = document.createElement('img');
		img1.id = 'img1' + pairs[i];
		$('#card1' + pairs[i]).append(img1);
		$('#img1' + pairs[i]).attr({
			'src':"../data/" + pairs[i] + "/1.jpg"
		});
	}

	var cards = $('.card');
	shuffle(cards);
	$('.card').remove();

	for( var i=0, l = cards.length; i<l;i++){
		$(cards[i]).attr("data-order", i);
		$('#container').append(cards[i]);
	}

	cards.on('click', function(){ 
		$("#foundScore").html( "Vous <strong>" + $(".found").length / 2 + "</strong>" );
		// $("#foundByOtherScore").html( "Paires trouvées par l'adversaire : " + $(".foundByOther").length / 2 + " / 9" );


		if((! $(this).hasClass("visible")) && (actives.length < 2)  && (! $(this).hasClass("found") ) && (! $(this).hasClass("visibleByOther") ) ){
			$(this).toggleClass("visible");
			console.log('click', { id:$(this).attr("data-order") } );
			socket.emit('click', { id:$(this).attr("data-order") } );

			actives = cards.filter(function(i, card){
				return $(card).hasClass("visible");
			});

			// console.log( parseInt("" + this.id[this.id.length - 2] + this.id[this.id.length - 1] ) );

			if( actives.length == 2 ){
				window.setTimeout( function(){
					$(actives[0]).toggleClass("visible");
					$(actives[1]).toggleClass("visible");

					if( Math.abs(parseInt("" + actives[0].id[actives[0].id.length - 3] + actives[0].id[actives[0].id.length - 2] + actives[0].id[actives[0].id.length - 1] ) - parseInt("" + actives[1].id[actives[1].id.length - 3] + actives[1].id[actives[1].id.length - 2] + actives[1].id[actives[1].id.length - 1] ) ) === 100 ){
						console.log( "found pair" );
						$(actives[0]).addClass("found");
						$(actives[1]).addClass("found");
						/*socket.emit('click', function( data ){
							  $(".card[data-order="+data.id+"]").toggleClass("foundByOther");
						}*/
						socket.emit('foundByOther', { id:$(actives[0]).attr("data-order") } );
						socket.emit('foundByOther', { id:$(actives[1]).attr("data-order") } );
					}
					// else{
						socket.emit('click', { id:$(actives[0]).attr("data-order") } );
						socket.emit('click', { id:$(actives[1]).attr("data-order") } );
					// }

					actives = cards.filter(function(i, img){
						return $(img).hasClass("visible");
					});

				}, 800 );
			}
		}

		if( $(".found").length == 18 ){
			$("#win").css("visibility", "visible");
			$("#win").append("<h3>9 " + $('.foundByOther').length / 2 + "</h3>");
		}

		if( $(".foundByOther").length == 18 ){
			$("#lose").css("visibility", "visible");
			$("#lose").append("<h3>9 " + $('.found').length / 2 + "</h3>");
		}

	});

});