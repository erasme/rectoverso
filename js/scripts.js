// todo afficher scores
// todo carrés de couleur sur les paires déjçà trouéves afin de mieux les différencier.
let player_id = '';
let console_verbosity = false;
let chosen_language = 'en';
let texts = {}; // Contains all texts displayed on this page.



/**
 * When we ask for a game, we need first to have a unique identifier.
 */
function askForGame(state='WAIT'){
    state = state.trim(); // I have no idea why state is someone preceded with spaces...
    if(console_verbosity){
        console.log(state);
    }

    // state is either 'WAIT' or a json string containing the pairs of cards.
    if(state === 'WAIT'){
        if(console_verbosity){
            console.log('Asked for a game start. Waiting other player(s).');
        }
        document.getElementById('textModalBox').innerText = texts['waiting_for_players'];
        setTimeout(() => {  ajaxRequest(askForGame, 'i_want_to_start_a_game', player_id); }, 1000);
    } else if(typeof state === 'string' && state.substr(0,5)==='ERROR'){
        // Checking for errors.
        if(console_verbosity){
            // For now, we only have two different errors.
            if(state === 'ERROR 1'){
                console.log('The current_game.json already have two players.');
            }
            else if(state === 'ERROR 2'){
                console.log('The file current_game.json is unreachable by the server.');
            }
            else {
                console.log('Unknown error : ' + state);
            }
        }
        document.getElementById('textModalBox').innerText = texts['error_from_server'];
    } else if(typeof state === 'string'){
        // Both players are recorded as ready to play on the server. We can start.
        cardPairs=JSON.parse(state);
        if(console_verbosity){
            console.log('The cards which we play with are : ')
            console.log(cardPairs);
        }
        startGame(cardPairs);
    } else {
        console.log('Unknown state. What is happening ?');
    }
}

/**
 * Everythng is ready, we can now let the player use the app.
 * @param state
 */
function startGame(state){
    /*
    Steps to follow :
    - hide the modalbox.
    - set a recurrent ajax task each second asking :
            - is the game finished ? (i.e. if the other player has already finished)
            - what is the other player's score ?
            - what cards do the other player chose to reveal ?
    - place the cards and create the game.
    - if we finish the game or we receive the signal the other player finished, we stop the game and replace the
    modalbox with new text
     */

    // First, hide the modalbox.
    const modal = document.getElementById('block_containing_modal_box_for_messages');
    modal.style.display='none';

    // Then, place pictures in the grid.
    shuffleAndPlacePictures(state);

    // Now prepare the ajax recurrent transaction.
    checkForOtherPlayersVictory('false');
}

function checkForOtherPlayersVictory(isGameFinished='false'){
    if (isGameFinished === 'true'){
        displayDefeat();
    } else {
        //setTimeout(() => {  ajaxRequest(checkForOtherPlayersVictory, 'is_game_finished', player_id); }, 1000);
    }
}


function displayDefeat(){
    replaceModal('Vous avez perdu.');
}


function replaceModal(textToDisplay){
    console.log(replaceModal.caller);

    const modal = document.getElementById('block_containing_modal_box_for_messages');
    modal.style.display='block';

    const textModalBox = document.getElementById('textModalBox');
    textModalBox.innerText = ''; // todo BUG mettre les textes de victoire et de défaite

    document.location.reload(true);
}

/**
 * Shuffles the cards in a single array. Then places it in the page.
 * @param picturesPairs The pairs of cards we must place in the grid.
 */
function shuffleAndPlacePictures(picturesPairs=''){
    // First, place all cards in a one dimension array.
    let crushedArray = Array();
    for (const imagePair in picturesPairs) {
        crushedArray.push(picturesPairs[imagePair][0]);
        crushedArray.push(picturesPairs[imagePair][1]);
    }
    // Now, let's shuffle this array.
    for(let i = crushedArray.length-1; i > 0; i--){
        const j = Math.floor(Math.random() * i)
        const temp = crushedArray[i]
        crushedArray[i] = crushedArray[j]
        crushedArray[j] = temp
    }

    // And place the pictures inside the cards.
    let i = 0
    for (const image in crushedArray) {
        document.getElementById("card_"+ i).getElementsByClassName("flip-card-back")[0].setAttribute("style", "background-image: url('"+crushedArray[image]+"');");
        i+=1;
    }
}

/**
 * Called when a card has been selected. It decides what happens next.
 * @param domObject The selected card.
 */
function selectCard(domObject){
    /*
    Multiple cases :
    - Already revealed -> Nothing to do. Ignore completely.
    - Not revealed and first in a row of revealed cards -> Reveal it and memorize it somewhere.
    - Not revealed and second in a row of revealed cards -> Reveal it and check if it is in the same pair as the first.
                                                                                    - if yes, add this pair in the list of fount pairs, then erase the row.
                                                                                    - if no, mask the two cards and erase the memorized row.
     */

    // Already revealed -> Ignore.
    if (domObject.classList.contains('flipped-card')){
        return;
    } else {
        domObject.classList.add('flipped-card');

        if(lastPlayedCard===''){ // Not revealed card and first in a row
            lastPlayedCard = domObject;
        } else{ // Not revealed card and second in a row.
            // We must check if both revealed cards are from the same pair.
            if (areTheseCardsTheInTheSamePair(lastPlayedCard, domObject)){
                /* The same pair :
                - let them revealed.
                - erase the memorized row.
                - increment the score.
                - is the game won ?
                 */
                lastPlayedCard = '';
                score+=1;
                if (score===9){
                    claimVictory();
                }
            } else{
                /*
                Not in the same pair :
                - mask them both.
                - erase the memorized row. -> done in the masking function.
                 */
                setTimeout(() => {mask2Cards(domObject, lastPlayedCard)}, 1000);
            }
        }
    }
}

function claimVictory(){
    ajaxRequest(displayVictory, 'i_won', player_id);
}

function displayVictory(){
    replaceModal('Vous avez gagné.');
}

/**
 *
 * @param domObject1
 * @param domObject2
 */
function mask2Cards(domObject1, domObject2){
    domObject1.classList.remove('flipped-card');
    domObject2.classList.remove('flipped-card');
    lastPlayedCard='';
}


/**
 * Using the uri of two images, we can check if they are from the same pair (i.e. if they are in the same folder).
 * @return {boolean}
 * @param card1
 * @param card2
 */
function areTheseCardsTheInTheSamePair(card1='', card2=''){
    const urlData1 = card1.firstElementChild.nextElementSibling.style.backgroundImage;
    const cardUrl1 = urlData1.substring(5, urlData1.length-2);
    //console.log(cardUrl1);

    const urlData2 = card2.firstElementChild.nextElementSibling.style.backgroundImage;
    const cardUrl2 = urlData2.substring(5, urlData2.length-2);
    //console.log(cardUrl2);

    const path1 = cardUrl1.split('/' );
    const path2 = cardUrl2.split('/' );
    return path1[2] === path2[2];
}


/**
 * Create a random string. Is size is given in argument.
 * @param identifier_length THe length of the random string we want.
 */
function createIdentifier(identifier_length=10){
    //player_id = 'riQ00YI2zd'; // todo deploiement : supprimer cette ligne
    //return; // todo deploiement : supprimer cette ligne
    player_id = '';
    const authorized_characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < identifier_length; i++ ) {
        player_id += authorized_characters.charAt(Math.floor(Math.random() * authorized_characters.length));
    }
    console.log('New player id created : ' + player_id);
}


/**
 * This is our Ajax controller. It takes care of all messages sent to the server and send back responses.
 */
function ajaxRequest(callback_function, request='', player_id='', asynchronicity= true) {
    let url;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            callback_function(this.responseText);
        }
    };
    switch (request){
        case '':
            console.log('You requested an empty data in your ajax request.');
            break;
        case 'is_console_verbose':
            url = 'index.php?message=is_console_verbose&playerId='+ player_id.toString();
            break;
        case 'what_is_the_chosen_language':
            url = 'index.php?message=what_is_the_chosen_language&playerId='+ player_id.toString();
            break;
        case 'get_Translations':
            xhttp.overrideMimeType("application/json");
            url = 'translations.json';
            break;
        case 'i_want_to_start_a_game':
            url = 'index.php?message=i_want_to_start_a_game&playerId='+ player_id.toString();
            break;
        case 'is_game_finished':
            console.log('The player ' + player_id + ' is asking if the game has been won by the other player.');
            url = 'index.php?message=is_game_finished&playerId='+ player_id.toString();
            break;
        case 'i_won':
            console.log('The player ' + player_id + ' claims victory.');
            url = 'index.php?message=i_won&playerId='+ player_id.toString();
            break;
        default:
            console.log('You made an unknown request ' + request + ' lors de votre ajaxRequest depuis ' + ajaxRequest.caller);
            url = 'index.php?message=' + request;
            break;
    }

    xhttp.open("GET", url, asynchronicity);
    xhttp.send();
}




/**                          CONFIGURATION                          **/


/**
 * Loads all the translations.
 */
function loadTranslations(){
    ajaxRequest(injectTranslations, 'get_Translations', player_id, false);
}

/**
 * Injects all translations in their correct emplacements.
 * @param json_translations String containing all translations.
 */
function injectTranslations(json_translations = ''){
    const translations = JSON.parse(json_translations);
    // As stupid as it sounds, I can't reach directly inside the json using translations[chosen_language].
    // So I have to do this loop...
    for (let language in translations){
        if (language === chosen_language){
            texts = translations[language];
            // We're in. Let's inject the text.
            document.getElementById('message_to_user').innerText = translations[language].start;
        }
    }
}

/**
 * For now, we only check if the application has been set to the modes :
 * - is the console verbose ?
 * - what is the language which has to be displayed ?
 */
function getModes(){
    ajaxRequest(setConsoleMode, 'is_console_verbose', player_id, false);
    ajaxRequest(setChosenLanguage, 'what_is_the_chosen_language', player_id, false);
}

/**
 * Sets the correct chosen language in the application.
 * @param language
 */
function setChosenLanguage(language='en'){
    chosen_language = language.trim();
    if (console_verbosity){
        console.log('The chosen language is set to : ' + chosen_language + '.');
    }
}

/**
 * Just sets up the console verbosity mode.
 * @param consoleMode
 */
function setConsoleMode(consoleMode='false'){
    console_verbosity = Boolean(consoleMode);
    if (console_verbosity){
        console.log('The console verbosity is set to : ' + console_verbosity + '.');
    }
}