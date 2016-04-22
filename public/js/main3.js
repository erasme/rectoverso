/*  
 *  Mode debug
 *
 *  @value   true   Affiche des informations dans la console
 *  @value   false  N'affiche rien dans la console
 */

var DEBUG = false;

/*  
 *  NON UTILISÉ (pour le moment - next feature à venir)
 *  Comportement des modes de jeu :
 *
 *  @MODE1  Freeplay, chaque joueur doit trouver
 *          toutes les paires en premier
 *
 *  @MODE2  Les paires trouvées par P1 
 *          bloquent les positions des carts de P1
 */

var MODE1 = 1,
    MODE2 = 2;

/*  
 *  États de jeu :
 *
 *  @STATE_INACTIVE   Écran de démarrage avec la présentation du jeu
 *  @STATE_RULES      Règles du jeu
 *  @STATE_WAITING    En attente du partenaire du jeu
 *  @STATE_PLAYING    Écran de jeu
 *  @STATE_WIN        Écran en cas de victoire
 *  @STATE_LOST       Écran en cas de défaite
 */

var STATE_INACTIVE = 0,
    STATE_RULES = 1,
    STATE_WAITING = 2,
    STATE_PLAYING = 3,
    STATE_WIN = 4,
    STATE_LOST = 5,
    STATE_CANTACCESS = 6;
    
/*  * * * * * * * * * * * *  *
 *                           *
 *   CONFIGURATION DU JEU    *
 *                           *
 *  * * * * * * * * * * * *  */

var STATE;
var MODE = MODE1;

var nbPairs   = 27;   // Nombre de dossiers dans /data/cards/
var nbBg      = 40;   // Nombre de dossiers dans /data/bg/

var totalPairs = [];

var tuto = null;

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

var visibleCards = 0;
var pairs = [];
var randoms = [];

var player = {};

var nbPairsPerPlayer = 2; // TODO : Set to 9 in prod (master) mode

var socket = io();

$(document).ready(function() {
  
  /*
   *  Attribution des couleurs 
   *  et de l'image de fond
   */
   
  /*
    
    TODO : Définir des paires de couleur, 
           pour assurer les contrastes et la lisibilité
    
  	$('body').css('color', 'rgb('+ color2 +')');
  	$('path').css('fill', 'rgb('+ color2 +')');
  */

	$('body').css('color', 'white');
	$('path').css('fill', 'white');

	getBackgroundPic();
	

  /*
   *  Événements socket
   */

	socket.on('resetGame', function() {
		location.assign(location);
	});

	socket.on('roomFull', function(data) {
		setStateTo(STATE_CANTACCESS);
		$('#cantaccess_room').text(data.room);
	});
   
  socket.on('newPlayer', function (data) {
    player.id = data.id;
    debug('Player ID : '+player.id);
  });

	socket.on('readyToPlay', function() {
		showBubbleOtherReady();
	});

	socket.on('startGame', function() {
		setStateTo(STATE_PLAYING);
	});
	
	socket.on('flippedCard', function (data) {
	  debug('Receive flippedCard : '+data.id);
    $('.card[data-order='+data.id+']').not('.card.found').addClass('visibleByOther');
	});
	
	socket.on('resetedCard', function (data) {
	  debug('Receive resetedCard : '+data.id);
    $('.card[data-order='+data.id+']').removeClass('visibleByOther');
	});

	socket.on('foundCard', function (data) {
    debug('Receive foundCard : '+data.id );
    $(".card[data-order="+data.id+"]").addClass('foundByOther');
	});

  socket.on('score', function (data) {

    for (var i in data) {
        
      //  On s'intéresse au joueur courant  

      if (data[i].id == player.id) {
        $('#foundScore strong, .scores_found').text(data[i].score);
        
        if (data[i].score == nbPairsPerPlayer) {
          setStateTo(STATE_WIN);
        }
      } 
      
      //  On s'intéresse aux autres joueurs
    
      else {
        $('#foundByOtherScore strong, .scores_foundByOther').text(data[i].score);
        
        if (data[i].score == nbPairsPerPlayer) {
          setStateTo(STATE_LOST);
        }
      }
    }
  });
  
  /*
   *  Événements de transition 
   *  entre les états des écrans de jeu
   */

  setStateTo(STATE_INACTIVE);

	$('#inactive').on('click', function(){
		setStateTo(STATE_RULES);
	});

	$('#rules').on('click', function(){		
		setStateTo(STATE_WAITING);		
	});

	$('.rejouer').on('click', function(){
		location.assign(location);
	});
});

function showBubbleOtherReady() {
  if (STATE != STATE_WAITING) {
    $('#bubble_otherReady').show();
  }
}

function hideBubbleOtherReady() {
  $('#bubble_otherReady').hide();
}



function startTuto() {  
  animateTuto();
}


function stopTuto() {  
  clearTimeout(tuto);
}

function animateTuto() {
  setTimeout(function(){
    $('#tuto .card').eq(0).addClass('visible');
  },500);
  
  setTimeout(function(){
    $('#tuto .card').eq(3).addClass('visible');
  },1200);
  
  setTimeout(function(){
    $('#tuto .card').eq(0).removeClass('visible').addClass('found');
    $('#tuto .card').eq(3).removeClass('visible').addClass('found');
  },2100);
  
  
  
  
  setTimeout(function(){
    $('#tuto .card').eq(2).addClass('visible');
  },2900);
  
  setTimeout(function(){
    $('#tuto .card').eq(1).addClass('visible');
  },3600);
  
  setTimeout(function(){
    $('#tuto .card').eq(2).removeClass('visible').addClass('found');
    $('#tuto .card').eq(1).removeClass('visible').addClass('found');
  },4500);
  
  
  
  
  setTimeout(function(){
    $('#tuto .card').eq(0).removeClass('found');
    $('#tuto .card').eq(1).removeClass('found');
    $('#tuto .card').eq(2).removeClass('found');
    $('#tuto .card').eq(3).removeClass('found');
  },6100);
  
  
  tuto = setTimeout(function(){ animateTuto(); },7000);
}

function setNewCardDeck() {
	get9RandomPairs();
}
   
	
function setCards() {
	/*
   *  Création des cartes
   */
   
	for (var i = 0; i < pairs.length; i++){
		
		/*
     *  On crée les cartes qui vont accueillir 
     *  la première image de chaque paire
		 */
		 
		if (typeof(pairs[i]) !== 'undefined') {
  		
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
       
  		var img0 = $('<div></div>')
  		  .attr('id','img0' + pairs[i])
  		  .attr('class','card_image card_child front')
  		  .attr('style','background-image:url(../data/cards/' + pairs[i] + '/0.jpg)');
  		  
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
       
  		var img1 = $('<div></div>')
  		  .attr('id','img1' + pairs[i])
  		  .attr('class','card_image card_child front')
  		  .attr('style','background-image:url(../data/cards/' + pairs[i] + '/1.jpg)');
  		  
  		$('#card1' + pairs[i]+' .card_wrap').append(img1);
  		
    }
	}

	var cards = $('#game .card');
	shuffle(cards);
	$('#game .card').remove();

	for( var i = 0, l = cards.length; i < l; i++) {
		$(cards[i]).attr('data-order', i);
		$('#game').append(cards[i]);
	}
	

	cards.on('mousedown', function() {
    /*
     *  S'il y a moins de 2 cartes au total retournées,
     *  si la carte touchée n'est pas déjà retournée,
     *  si la carte touchée n'est pas déjà trouvée
     *  si la carte touchée n'est pas bloquée par l'autre joueur
     */

		if (($('#game .card.visible').length < 2) 
		 && (!$(this).hasClass('visible'))
		 && (!$(this).hasClass('found'))
		 && (!$(this).hasClass('visibleByOther'))) {
  		 
  		 // TODO MODE2 : && (!$(this).hasClass('foundByOther'))
  		 
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

			if ($('#game .card.visible').length == 2) {
				window.setTimeout(function() {
  				debug('Deux cartes retournées : on vérifie');
  				
          /*
           *  On compare l'identifiant de la paire [data-pair-id="X"]
           *  de toutes les .card.visible pour vérifier la paire ;
           *  l'identifiant de la première carte sert de comparatif
           */
					
					var pairIdToFetch = $('#game .card.visible').eq(0).data('pair-id');
					var isPair = true;
										
					for (var i = 1; i < $('#game .card.visible').length; i++) {
  					if ($('#game .card.visible').eq(i).data('pair-id') != pairIdToFetch) {
    					isPair = false;
  					}
					}
					
					/*
  				 *  Si on a une paire
  				 */

					if (isPair) {
						debug('Paire trouvée');
						
						$('#game .card.visible').addClass('found');
						
						socket.emit('foundPair', {pair: pairIdToFetch});			
									
            for (var i = 0; i < $('#game .card.visible').length; i++) {
						  socket.emit('foundCard', { id: $('#game .card.visible').eq(i).attr('data-order') });
						}
					}
					
					/*
  				 *  On libère les 2 cartes pour les autres joueurs
  				 */
					
          for (var i = 0; i < $('#game .card.visible').length; i++) {
					  socket.emit('resetedCard', { id:$('#game .card.visible').eq(i).attr('data-order') });
					}
						
          $('#game .card.visible').removeClass('visible');

				}, 800);
			}
		}
	});
}

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
  pairs = [];
  randoms = [];

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
	var randomBg = Math.round(Math.random()*nbBg)+1;
	
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


/*
 *  setStateTo(newState)
 *
 *  @param  newState (type: Int)
 *    @value    STATE_INACTIVE    0
 *    @value    STATE_RULES       1
 *    @value    STATE_WAITING     2
 *    @value    STATE_PLAYING     3
 *    @value    STATE_WIN         4
 *    @value    STATE_LOST        5
 */

function setStateTo(newState) {
  if (STATE != newState) {
    $('.state').hide();
    
    socket.emit('changedState', { state : newState });
    
    switch (newState) {
      case STATE_INACTIVE :
        $('#inactive').show();
        break;
        
      case STATE_RULES :
        $('#rules').show();
        startTuto();
        break;
        
      case STATE_WAITING :
        $('#rules').show();
        $('#waiting').show();
        hideBubbleOtherReady();
    		setNewCardDeck();
    		socket.emit('readyToPlay', true);
        break;
        
      case STATE_PLAYING :
        $('#game').show();
        hideBubbleOtherReady();
        setCards();
        stopTuto();
        break;
        
      case STATE_WIN :
        $('#win').show();
        window.setTimeout( function(){ location.assign(location); }, 10000 );
        break;
        
      case STATE_LOST :
        $('#lost').show();
      //  window.setTimeout( function(){ location.assign(location); }, 10000 );
        break;
        
      case STATE_CANTACCESS :
        $('#cantaccess').show();
        window.setTimeout( function(){ location.assign(location); }, 10000 );
        break;
        
      default :
        $('#inactive').show();
        break;
    }
    
    STATE = newState;
  }
}

/*
 *  debug(content)
 *
 *  Permet d'afficher des informations dans la console
 *  en mode debug (DEBUG = true)
 */
 
function debug(c) {
  if (DEBUG) console.log(c);
}