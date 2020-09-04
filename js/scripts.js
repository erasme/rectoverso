/**
 * When we ask for a game, we need first to have a unique identifier.
 */
function askForGame(state='WAIT'){
    // state is either 'WAIT' or a json string containing the pairs of cards.
    if(state === 'WAIT'){
        console.log('Waiting for other player.');
        // todo change the text of the modalbox to 'Waiting the other player.'
        setTimeout(() => {  ajaxRequest(askForGame, 'i_want_to_start_a_game', player_id); }, 1000);
    } else {
        cardPairs=JSON.parse(state);
        console.log('Other player is ready. Let\'s start the game.');
        //console.log(cardPairs);
        startGame(cardPairs);
    }
}

/**
 * Everythng is ready, we can now let the leyer use the app.
 * @param state
 */
function startGame(state){
    /*
    Steps to follow :
    - hide the modalbox.
    - set a recurrent ajax task each second asking if the game is finished (i.e. if the other player has already finished).
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
        setTimeout(() => {  ajaxRequest(checkForOtherPlayersVictory, 'is_game_finished', player_id); }, 1000);
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
    const authorized_characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < identifier_length; i++ ) {
        player_id += authorized_characters.charAt(Math.floor(Math.random() * authorized_characters.length));
    }
}


/**
 * This is our Ajax controller. It takes care of all messages sent to the server and send back responses.
 */
function ajaxRequest(callback_function, request='', player_id='') {
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
        case 'is_game_finished':
            console.log('The player ' + player_id + ' is asking if the game has been won by the other player.');
            url = 'index.php?message=is_game_finished&playerId='+ player_id.toString();
            break;
        case 'i_won':
            console.log('The player ' + player_id + ' claims victory.');
            url = 'index.php?message=i_won&playerId='+ player_id.toString();
            break;
        default:
            console.log('You made an unknown request ' + request + 'lors de votre ajaxRequest depuis ' + ajaxRequest.caller);
            url = 'index.php?message=' + request;
            break;
    }

    xhttp.open("GET", url, true);
    xhttp.send();
}