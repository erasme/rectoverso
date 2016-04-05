var nbPairs   = 27;   // Nombre de dossiers dans /data/pairs/
var nbBg      = 41;   // Nombre de dossiers dans /data/bg/

var STATE_INACTIVE = 0,
    STATE_RULES = 1,
    STATE_WAITING = 2,
    STATE_PLAYING = 3,
    STATE_WIN = 4,
    STATE_LOST = 5;

var STATE = STATE_INACTIVE;

var totalPairs = [];

for (var i = 1; i <= nbPairs; i++) {
  totalPairs.push(i);
}

var colors1 = [
  "0, 0, 54", 
  "0, 0, 122", 
  "113, 10, 169", 
  "0, 132, 108", 
  "255, 16, 52"
];

var colors2 = [
  "255, 102, 102", 
  "255, 197, 99", 
  "255, 255, 116", 
  "110, 151, 255", 
  "159, 236, 255", 
  "159, 236, 255", 
  "160, 160, 160", 
  "160, 128, 189", 
  "100, 241, 142"
];

var color1 = colors1[Math.floor(Math.random() * colors1.length)];
var color2 = colors2[Math.floor(Math.random() * colors2.length)];
var rewardPatterns = ['0', '1', '2'];
var rewardPattern = rewardPatterns[Math.floor(Math.random() * rewardPatterns.length)];

var pairs = [];
var visibleCards = 0;
var randoms = [];

var player = {};

var nbPairsPerPlayer = 9;

function setStateTo(newState) {
  $('.state').hide();
  
  switch (newState) {
    case STATE_INACTIVE :
      $('#inactive').show();
      break;
      
    case STATE_RULES :
      $('#rules').show();
      break;
      
    case STATE_WAITING :
      $('#waiting').show();
      break;
      
    case STATE_PLAYING :
      $('#game').show();
      break;
      
    case STATE_WIN :
      $('#win').show();
    // window.setTimeout( function(){ location.assign(location); }, 30000 );
      break;
      
    case STATE_LOST :
      $('#lost').show();
    // window.setTimeout( function(){ location.assign(location); }, 30000 );
      break;
      
    default :
      $('#inactive').show();
      break;
  }
}




$(document).ready(function() {
	var socket = io();

  /*
   *  Événements socket
   */
   
  socket.on('newPlayer', function (data) {
    player.id = data.id;
    console.log('Player ID : '+player.id);
  });
	
	socket.on('flippedCard', function (data) {
	  console.log('Receive flippedCard : ', data.id);
    $('.card[data-order='+data.id+']').addClass('visibleByOther');
	});
	
	socket.on('resetedCard', function (data) {
	  console.log('Receive resetedCard : ', data.id);
    $('.card[data-order='+data.id+']').removeClass('visibleByOther');
	});

	socket.on('foundCard', function (data) {
    console.log('Receive foundCard : ', data.id );
    $(".card[data-order="+data.id+"]").addClass('foundByOther');
	});

  socket.on('score', function (data) {
    for (var i = 0; i < data.length; i++) {  
      
      /*
       *  On s'intéresse au joueur courant
       */   
        
      if (data[i].id == player.id) {
        $('#foundScore strong, .scores_found').text(data[i].score);
        
        if (data[i].score == nbPairsPerPlayer) {
          setStateTo(STATE_WIN);
        }
      } 
      
      /*
       *  On s'intéresse aux autres joueurs
       */
      
      else {
        $('#foundByOtherScore strong, .scores_foundByOther').text(data[i].score);
        
        if (data[i].score == nbPairsPerPlayer) {
          setStateTo(STATE_LOST);
        }
      }
    }
  });

	$('body').css('color', 'rgb('+ color2 +')');
	$('path').css('fill', 'rgb('+ color2 +')');

	getBackgroundPic();

	get9RandomPairs();

  setStateTo(STATE_INACTIVE);

	$('#inactive').on('click', function(){
		setStateTo(STATE_RULES);
	});

	$('#rules').on('click', function(){		
		setStateTo(STATE_WAITING);
		
		socket.emit('readyToPlay', true);
	});

	socket.on('startGame', function() {
		setStateTo(STATE_PLAYING);
	});

	/*
   *  Création des cartes
   */
	
	for (var i = 0; i < pairs.length; i++){
		
		/*
     *  On crée les cartes qui vont accueillir 
     *  la première image de chaque paire
		 */
		 
		var card0 = $('<div></div>')
		  .attr('class','card')
		  .attr('id','card0' + pairs[i])
		  .attr('data-pair-id',pairs[i]);
		  
		$('#game').append(card0);
		$('#card0' + pairs[i]).append('<div class="card_wrap"><div class="back"></div></div>');

		/*
     *  On insère chaque première image 
     *  dans les cartes
     */
     
		var img0 = $('<img/>')
		  .attr('id','img0' + pairs[i])
		  .attr('class','card_child front')
		  .attr({'src':'../data/cards/' + pairs[i] + '/0.jpg'});
		  
		$('#card0' + pairs[i]+' .card_wrap').append(img0);
		  

		/*
     *  On crée les cartes qui vont accueillir 
     *  la deuxième image de chaque paire
     */
		
		var card1 = $('<div></div>')
		  .attr('class','card')
		  .attr('id','card1' + pairs[i])
		  .attr('data-pair-id',pairs[i]);
		  
		$('#game').append(card1);
		$('#card1' + pairs[i]).append('<div class="card_wrap"><div class="back"></div></div>');

		/*
     *  On insère chaque deuxième image 
     *  dans les cartes
     */
     
		var img1 = $('<img/>')
		  .attr('id','img1' + pairs[i])
		  .attr('class','card_child front')
		  .attr({'src':'../data/cards/' + pairs[i] + '/1.jpg'});
		  
		$('#card1' + pairs[i]+' .card_wrap').append(img1);
	}

	var cards = $('.card');
	shuffle(cards);
	$('.card').remove();

	for( var i = 0, l = cards.length; i < l; i++){
		$(cards[i]).attr('data-order', i);
		$('#game').append(cards[i]);
	}

	cards.on('click', function(){ 
  	
    /*
     *  S'il y a moins de 2 cartes au total retournées,
     *  si la carte touchée n'est pas déjà retournée,
     *  si la carte touchée n'est pas déjà trouvée
     *  si la carte touchée n'est pas bloquée par l'autre joueur
     */

		if (($('.card.visible').length < 2) 
		 && (!$(this).hasClass('visible'))
		 && (!$(this).hasClass('found'))
		 && (!$(this).hasClass('visibleByOther'))) {
  		 
      /*
       *  On retourne la carte
       *  et on envoie un événement socket
       */
  		 
			$(this).toggleClass('visible');
			
			socket.emit('flippedCard', { id: $(this).attr('data-order') });

      /*
       *  S'il y a 2 cartes retournées,
       *  on vérifie si c'est une paire ou non
       */

			if ($('.card.visible').length == 2) {
				window.setTimeout(function() {
  				console.log('Deux cartes retournées : on vérifie');
  				
          /*
           *  On compare l'identifiant de la paire [data-pair-id="X"]
           *  de toutes les .card.visible pour vérifier la paire ;
           *  l'identifiant de la première carte sert de comparatif
           */
					
					var pairIdToFetch = $('.card.visible').eq(0).data('pair-id');
					var isPair = true;
										
					for (var i = 1; i < $('.card.visible').length; i++) {
  					if ($('.card.visible').eq(i).data('pair-id') != pairIdToFetch) {
    					isPair = false;
  					}
					}
					
					/*
  				 *  Si on a une paire
  				 */

					if (isPair) {
						console.log('Paire trouvée');
						
						$('.card.visible').addClass('found').find('.card_wrap').append('<div class="foundReward card_child front"></div>');						
						$('.foundReward').css("background", "url('../data/rewards/" + rewardPattern + ".png') no-repeat, rgba(255,255,255,.3)");
						
						socket.emit('foundPair', {pair: pairIdToFetch});			
									
            for (var i = 0; i < $('.card.visible').length; i++) {
						  socket.emit('foundCard', { id: $('.card.visible').eq(i).attr('data-order') });
						}
					}
					
					/*
  				 *  On libère les 2 cartes pour les autres joueurs
  				 */
					
          for (var i = 0; i < $('.card.visible').length; i++) {
					  socket.emit('resetedCard', { id:$('.card.visible').eq(i).attr('data-order') });
					}
						
          $('.card.visible').removeClass('visible');

				}, 800);
			}
		}
	});

	$('.rejouer').on('click', function(){
		location.assign(location);
	});


});

/*
 *  getRandomIndex()
 *
 *  Extrait une valeur aléatoire unique issue du tableau `totalPairs`
 *  (il ne peut pas y avoir de doublon dans les multiples appels de getRandomIndex() )
 */

function getRandomIndex() {
	var random = Math.floor(Math.random()*nbPairs);
	
	if (randoms.indexOf(random) == -1) {
		randoms.push(random);
		return random;
	} else {
		return getRandomIndex();
	}
}

/*
 *  get9RandomPairs()
 *
 *  Récolte 9 paires 
 */

function get9RandomPairs(){
	for (var i = 0; i < 9; i++) {
		var random = getRandomIndex();
		pairs.push(random);
	}
	
	for (var i = 0; i < pairs.length; i++){
		pairs[i] = totalPairs[pairs[i]];
	}
}

/*
 *  getBackgroundPic()
 *
 *  Attribue une image de fond aléatoirement choisie
 *  et une teinte aléatoirement choisie
 */

function getBackgroundPic() {
	var randomBg = Math.round(Math.random()*nbBg);
	
	$('.imageBg').css({
		"background" : "url('../data/bg/" + randomBg + ".jpg') no-repeat center center / cover"
	});
	
	$('.colorBg').css({
  	"background" : "rgba(" + color1 + ",0.4)"
	});
}

/*
 *  shuffle(a)
 *
 *  @param  a (type: Array)
 */

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i -= 1) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}