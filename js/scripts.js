/**
 * When we ask for a game, we need first to have a unique identifier.
 */
function askForGame(){
    //console.log('my id is : ' + createIdentifier() + ' toto');

    ajaxRequest('i_want_to_start_a_game', createIdentifier());
}


/**
 * Create a random string. Is size is given in argument.
 * @param identifier_length THe length of the random string we want.
 * @return {string} The random string created.
 */
function createIdentifier(identifier_length=10){
    let authorized_characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for ( let i = 0; i < identifier_length; i++ ) {
        result += authorized_characters.charAt(Math.floor(Math.random() * authorized_characters.length));
    }
    return result;
}


/**
 * This is our Ajax controller. It takes care of all messages sent to the server and send back responses.
 */
function ajaxRequest(request='', player_id='') {
    let url;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);
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