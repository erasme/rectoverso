let player_id = '';
let console_verbosity = false; // Default value which are going to be replaced by the server value (from configuration.json).
let chosen_language = 'en'; // Default value which are going to be replaced by the server value (from configuration.json).
let texts = {}; // Contains all texts displayed on this page.
let cards = {}; // Contains all our (shuffled) cards.
let lastPlayedCard = ''; // The name of the last played card.
let current_score = 0; // The current player's score.
let i_won = false;

// todo check verbosity when cards are masked after end game.

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
                //console.log('The current_game.json already have two players.'); todo remake errors
            }
            else if(state === 'ERROR 2'){
                // console.log('The file current_game.json is unreachable by the server.'); todo remake errors
            }
            else {
                console.log('Unknown error : ' + state);
            }
        }
        document.getElementById('textModalBox').innerText = texts['error_from_server'];
    } else if(typeof state === 'string'){
        // Both players are recorded as ready to play on the server. We can start.
        console.log('state' + state);
        cards=JSON.parse(state);
        if(console_verbosity){
            console.log('The cards which we play with are : ')
            console.log(cards);
        }
        startGame(cards);
    } else {
        console.log('Unknown state. What is happening ?');
    }
}

/**
 * Everything is ready, we can now let the player use the app.
 * @param state json-data
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
    placePictures(state);

    // Now prepare the ajax recurrent transaction.
    checkForUpdatedData({});
}


/**
 * We set a recurrent ajax task each second asking :
 * - is the game finished ? (i.e. if the other player has already finished)
 * - what is the other player's score ?
 * - which cards do the other player chose to reveal ?
 * @param newData
 */
function checkForUpdatedData(newData={}){
    if(console_verbosity){
        console.log('update' + Math.random());
        console.log(newData);
    }

    if (typeof newData === 'string') {
        const myData = JSON.parse(newData);
        if(myData.is_game_finished === "0"){
            // The game is not finished, we only have to :
            // - show for one second the card played by the opponent.
            // - update the opponent score.
            for (const playedCard in myData.lastRevealedCards) {
                if(myData.lastRevealedCards[playedCard][1] === false){
                    const cardToDisplay = getCardByurl(myData.lastRevealedCards[playedCard][0]);
                    if ( revealCard(cardToDisplay) ) {// Reveal the card.
                        setTimeout(() => {maskACard(cardToDisplay)}, 1000); // And hide it one second later.
                    }
                }
            }
            updateScore(2, myData.otherPlayerScore);
        } else if (!i_won || myData.otherPlayerScore===9 || myData.otherPlayerScore==='9'){
                declareDefeat();
                return;
        } else if(myData.is_game_finished === "1"){
            return;
        }
    }
    setTimeout(() => {  ajaxRequest(checkForUpdatedData, 'check_updates', player_id); }, 1000);
}

/**
 * Displays the defeat screen to the player.
 */
function declareDefeat(){
    replaceModal(texts['you_lost']);
    resetCards();
}

/**
 * Declares the end of the game to the server and to the current player.
 */
function claimVictory(){
    ajaxRequest(emptyCallback, 'i_won', player_id, true);
    i_won = true;
    replaceModal(texts['you_won']);
    resetCards();
}

/**
 * Masks all cards.
 */
function resetCards() {
    const allCards = document.getElementsByClassName('flip-card-inner');
    console.log(allCards);

    for (let i = 0; i < allCards.length; i++) {
        if (typeof allCards[i] === "object") {
            allCards[i].classList.remove('flipped-card');
        }
    }
}

/**
 * Masks a card by removing a CSS class in its DOM object.
 * @param domObject
 */
function maskACard(domObject={}){
    domObject.classList.remove('flipped-card');
}

/**
 * Reveals a card in the game by adding a CSS class do the DOM object..
 * @param domObjectCard
 */
function revealCard(domObjectCard={}){
    if (! domObjectCard.classList.contains('flipped-card')) {
        domObjectCard.classList.add('flipped-card');
        return true;
    }
    return false;
}


/**
 * Using a url, we can retrieve the corresponding DOM object representing this card.
 * @param urlValue
 * @return {boolean|*}
 */
function getCardByurl(urlValue=''){
    const cards = document.getElementsByClassName("flip-card-back");
    for (const card in cards){
        try { // Not all items are dom objects (and so not having these attributes)
            if(cards[card].style.backgroundImage === urlValue){
                return cards[card].parentElement;
            }
        } catch (error){
            // We pass eventual errors iterating meaningless items of the dom collection.
        }
    }
    return false;
}


function replaceModal(textToDisplay){
    const modal = document.getElementById('block_containing_modal_box_for_messages');
    modal.style.display='block';

    document.getElementById('textModalBox').innerText = textToDisplay;
}

/**
 * Places all cards it in the page using pictures received in a json object.
 * @param pictures in a json object
 */
function placePictures(pictures= {}){
    let i = 0
    for (const image in pictures) {
        document
            .getElementById("card_"+ i)
            .getElementsByClassName("flip-card-back")[0]
            .setAttribute("style", "background-image: url('"+pictures[image]+"');");
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
    if (! domObject.classList.contains('flipped-card')){
        domObject.classList.add('flipped-card');
        ajaxRequest(emptyCallback, 'a_card_has_been_played', player_id, true, domObject.firstElementChild.nextElementSibling.style.backgroundImage);

        if(lastPlayedCard ===''){ // Not revealed card and first in a row
            lastPlayedCard = domObject;
        } else { // Not revealed card and second in a row.
            // We must check if both revealed cards are from the same pair.
            if (areTheseCardsTheInTheSamePair(lastPlayedCard, domObject)){
                /* The same pair :
                - let them revealed.
                - erase the memorized row.
                - increment the score.
                - is the game won ?
                 */
                lastPlayedCard = '';
                current_score+=1;
                updateScore(1, current_score);
                ajaxRequest(emptyCallback, 'i_scored', player_id, true, current_score);
                if (current_score === 9){
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

/**
 * This function does nothing and is here to catch all unnecessary callbacks... until i find a better idea.
 * @param args
 */
function emptyCallback(args=''){
    //console.log('callback : ' + args);
}


/**
 * Updates the score at the bottom of the page.
 * @param player_number The player to modify. 1 = current player, 2 = opponent.
 * @param player_score The new score to inject.
 */
function updateScore(player_number= 1, player_score = 0){
    if (player_number===1){ // If we want to modify player 1's score.
        document.getElementById('p1').innerHTML = player_score.toString();
    } else {
        document.getElementById('p2').innerHTML = player_score.toString();
    }
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

    const urlData2 = card2.firstElementChild.nextElementSibling.style.backgroundImage;
    const cardUrl2 = urlData2.substring(5, urlData2.length-2);

    const path1 = cardUrl1.split('/' );
    const path2 = cardUrl2.split('/' );
    return path1[2] === path2[2];
}


/**
 * Create a random string. Is size is given in argument.
 * @param identifier_length THe length of the random string we want.
 */
function createIdentifier(identifier_length=10){
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
function ajaxRequest(callback_function, request='', player_id='', asynchronicity= true, extra_parameter='') {
    let url;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            callback_function(this.responseText);
        }
    };
    switch (request){
        case '':
            if (console_verbosity){
                console.log('You requested an empty data in your ajax request.');
            }
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
        case 'check_updates':
            if (console_verbosity){
                //console.log('The player ' + player_id + ' is asking for new updates.');
            }
            url = 'index.php?message=check_updates&playerId='+ player_id.toString();
            break;
        case 'i_scored':
            url = 'index.php?message=i_scored&playerId='+ player_id.toString() + '&score=' + extra_parameter;
            break;
        case 'a_card_has_been_played':
            if (console_verbosity){
                console.log('A card has been played.');
                console.log(extra_parameter);
            }
            url = 'index.php?message=a_card_has_been_played&playerId='+ player_id.toString() + '&cardPlayed=' + extra_parameter;
            break;
        case 'i_won':
            if (console_verbosity){
                console.log('The player ' + player_id + ' claims victory.');
            }
            url = 'index.php?message=i_won&playerId='+ player_id.toString();
            break;
        default:
            if (console_verbosity){
                console.log('You made an unknown request ' + request + ' lors de votre ajaxRequest depuis ' + ajaxRequest.caller);
            }
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

            // -> Greeting text.
            document.getElementById('message_to_user').innerText = translations[language].start;

            // -> Player names in scores.
            document.getElementById('player_1').innerText = translations[language].you;
            document.getElementById('player_2').innerText = translations[language].opponent;
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