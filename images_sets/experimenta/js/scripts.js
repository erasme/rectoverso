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

var cardsFolders = [];

// TODO
// Gérer le dossier /cards/default ou /cards/{data-folder}

var cardsFolder = 'default';
var nbPairs   = 27;   // Nombre de dossiers dans /data/cards/
var roomOfCardsFolder = 'default';
temp_setCardsFolder('default/');


setSoundVolume($('#SonAmbiance'),.2);



function setSoundVolume(sound, vol) {
  if (sound) {
    sound.animate({volume:vol}, 2000);
  }
}


function setCardsFolder(folder, pairs, room) {
  roomOfCardsFolder = room;
  cardsFolder = folder;
  nbPairs = pairs;

  if (nbPairsPerPlayer > nbPairs) {
    nbPairsPerPlayer = nbPairs;
  }
}

var totalPairs = [];

var tuto = null;

for (var i = 1; i <= nbPairs; i++) {
  totalPairs.push(i);
}

var colors1 = [
  "0, 0, 54"/*,
  "0, 0, 122",
  "113, 10, 169",
  "0, 132, 108",
  "255, 16, 52"*/
];

var color1 = colors1[Math.floor(Math.random() * colors1.length)];

var pairs = [];
var randoms = [];
var player = {};

var nbPairsPerPlayer = 8; // TODO : Set to 9 in prod (master) mode

var socket = io();

$(document).ready(function() {

  /*
   *  Attribution de la couleur de fond
   */

	$('[data-background-color]').css({
  	"background" : "rgba(" + color1 + ",0.4)"
	});

  /*
   *  Événements socket
   */

	socket.on('resetGame', function() {
		location.assign(location);
	});

	socket.on('roomFull', function(data) {
		setStateTo(STATE_CANTACCESS);
		$('.CantAccessRoom').text(data.room);
	});

  socket.on('newPlayer', function (data) {
    player.id = data.id;
    debug('Player ID : '+player.id);

  	$('.Tap').on('click', function(){
    //	setCardsFolder($(this).data('folder'), $(this).data('pairs'));
  		setStateTo(STATE_RULES);
  	});
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
    var playerScore;
    var otherScore;

    for (var i in data) {

      //  On s'intéresse au joueur courant

      if (data[i].id == player.id) {
        $('#foundScore strong, .Scores_found').text(data[i].score);

        playerScore = data[i].score;

        if (data[i].score == nbPairsPerPlayer) {
          setStateTo(STATE_WIN);
        }
      }

      //  On s'intéresse aux autres joueurs

      else {
        $('#foundByOtherScore strong, .Scores_foundByOther').text(data[i].score);

        otherScore = data[i].score;

        if (data[i].score == nbPairsPerPlayer) {
          setStateTo(STATE_LOST);
        }
      }
    }

    var scoreToColor = Math.round(Math.abs(playerScore-otherScore)/nbPairsPerPlayer*100);

    console.log('scoreToColor : '+scoreToColor);

    $('.colorBg').css({
      'background-color':'hsl('+scoreToColor+',50%,60%)'
    });
  });

  /*
   *  Événements de transition
   *  entre les états des écrans de jeu
   */

  setStateTo(STATE_INACTIVE);

  /*
	$('#inactive').on('click', function(){
  //	setCardsFolder('');
		setStateTo(STATE_RULES);
	});
	*/

	$('#rules').on('click', function(){
		setStateTo(STATE_WAITING);
	});

	$('.ButtonButtonRejouer').on('click', function(){
		//location.assign(location);
		location.reload();
	});
});

function showBubbleOtherReady() {
  if (STATE != STATE_WAITING) {
    $('.Bubble__OtherReady').show();
  }
}

function hideBubbleOtherReady() {
  $('.Bubble__OtherReady').hide();
}

function startTuto() {
  animateTuto();
}

function stopTuto() {
  clearTimeout(tuto);
}

function animateTuto() {
  setTimeout(function(){
    $('.TutoDemo .card').eq(0).addClass('visible');
  },500);

  setTimeout(function(){
    $('.TutoDemo .card').eq(3).addClass('visible');
  },1200);

  setTimeout(function(){
    $('.TutoDemo .card').eq(0).removeClass('visible').addClass('found');
    $('.TutoDemo .card').eq(3).removeClass('visible').addClass('found');
  },2100);




  setTimeout(function(){
    $('.TutoDemo .card').eq(2).addClass('visible');
  },2900);

  setTimeout(function(){
    $('.TutoDemo .card').eq(1).addClass('visible');
  },3600);

  setTimeout(function(){
    $('.TutoDemo .card').eq(2).removeClass('visible').addClass('found');
    $('.TutoDemo .card').eq(1).removeClass('visible').addClass('found');
  },4500);




  setTimeout(function(){
    $('.TutoDemo .card').eq(0).removeClass('found');
    $('.TutoDemo .card').eq(1).removeClass('found');
    $('.TutoDemo .card').eq(2).removeClass('found');
    $('.TutoDemo .card').eq(3).removeClass('found');
  },6100);


  tuto = setTimeout(function(){ animateTuto(); },7000);
}

function setNewCardDeck() {
	getRandomPairs();
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
  		  .attr('style','background-image:url(/assets/'+room+'/cards/'+cardsFolder+'/' + pairs[i] + '/0.jpg)');

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
  		  .attr('style','background-image:url(/assets/'+room+'/cards/'+cardsFolder+'/' + pairs[i] + '/1.jpg)');

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
 *  getRandomPairs()
 *
 *  Récolte 9 paires
 */

function getRandomPairs(){
  pairs = [];
  randoms = [];

  console.log('getRandomPairs : nbPairsPerPlayer : '+nbPairsPerPlayer);

	for (var i = 0; i < nbPairsPerPlayer; i++) {
		var random = getRandomIndex();
		pairs.push(random);
	}

	for (var i = 0; i < pairs.length; i++){
		pairs[i] = totalPairs[pairs[i]];
	}
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
    $('.State').hide();

    socket.emit('changedState', { state : newState });

    switch (newState) {
      case STATE_INACTIVE :
        $('#inactive').show();
        break;

      case STATE_RULES :
        $('#rules').show();
        setSoundVolume($('#SonAmbiance'), .5);
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
        setSoundVolume($('#SonAmbiance'), .7);
        setCards();
        stopTuto();
        break;

      case STATE_WIN :
        $('#win').show();
        window.setTimeout( function(){ location.assign(location); }, 10000 );
        setSoundVolume($('#SonAmbiance'), .4);
        break;

      case STATE_LOST :
        $('#lost').show();
        setSoundVolume($('#SonAmbiance'), .4);
      //  window.setTimeout( function(){ location.assign(location); }, 10000 );
        break;

      case STATE_CANTACCESS :
        $('#cantaccess').show();
        setSoundVolume($('#SonAmbiance'), .1);
        window.setTimeout( function(){ location.assign(location); }, 3000 );
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

function countFoldersInFolder(dir){
  var count = 0;

  $.ajax({
    url: '../api/getDirectories/'+room+'/'+dir,
    success: function (data) {
      console.log(data);
    }
  });

  return count;
}

function temp_setCardsFolder(_cardsFolder){
  var count = 0;

  $.ajax({
    url: '../api/getDirectories/'+room+'/'+_cardsFolder,
    success: function (data) {
      console.log(data);
      setCardsFolder(data.cardsFolder, data.folders.length, data.room);
    }
  });
}
