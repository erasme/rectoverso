let player_id;
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * When we ask for a game, we need first to have a unique identifier.
 */
function askForGame(state='WAIT'){
    if(state === 'WAIT'){
        console.log('Waiting for other player.');
        // todo change the text of the modalbox to 'Waiting the other player.'
        setTimeout(() => {  ajaxRequest(askForGame, 'i_want_to_start_a_game', player_id); }, 1000);
    } else if (state === 'START'){
        console.log('Other player is ready. Let\'s start the game.');
        // todo : get the images from the server
        startGame();
    }
}


function startGame(){
    /*
    Steps to follow :
    - hide the modalbox.
    - set a recurrent ajax task each second asking if the game is finished (i.e. if the other player has already finished).
    - place the cards and create the game.
    - if we finish the game or we receive the signal the other player finished, we stop the game and replace the
    modalbox with new text
     */
}


/**
 * Create a random string. Is size is given in argument.
 * @param identifier_length THe length of the random string we want.
 */
function createIdentifier(identifier_length=10){
    player_id = 'riQ00YI2zd'; // todo deploiement : supprimer cette ligne
    return; // todo deploiement : supprimer cette ligne
    let authorized_characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < identifier_length; i++ ) {
        player_id += authorized_characters.charAt(Math.floor(Math.random() * authorized_characters.length));
    }
}


/**
 * This is our Ajax controller. It takes care of all messages sent to the server and send back responses.
 */
function ajaxRequest(callback_function='', request='', player_id='') {
    console.log('id reçu : ' + player_id);
    let url;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            callback_function(this.responseText);
        }
    };
    switch (request){
        case '':
            console.log('You requested an empty data in your ajax request.');
            break;
        case 'i_want_to_start_a_game':
            url = 'index.php?message=i_want_to_start_a_game&playerId='+ player_id.toString();
            break;
        default:
            console.log('You made an unknown request ' + request + 'lors de votre ajaxRequest depuis ' + ajaxRequest.caller);
            url = 'index.php?message=' + request;
            break;
    }

    xhttp.open("GET", url, true);
    xhttp.send();
}