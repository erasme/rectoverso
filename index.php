 <?php
/**
 * @author : Pierre-Alexandre Racine (pierrealexandreracine -at(@)- gmail -dot(.)- com)
 * @owner : ERASME (https://www.erasme.org/)
 * @copyright : ERASME (https://www.erasme.org/)
 * @license  : ALFERO GPL ( https://www.gnu.org/licenses/agpl-3.0.fr.html )
 * Project : Recto-Verso
 * Date: 02/09/2020
 * Time: 09:49
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'data/DataBaseConnection.php';


/*
 * For a better understanding of the application, refer yourself to the readme.md file.
 *
 * Here is the BO code. This page is called as an API by the UI.
 *
 * It does these actions :
 *
 * - loads the configuration file (configuration.json).
 * - waits for all players.
 * - if all players have sent their willing to play, it creates the new game in the database and send the players the
 * data for this new game.
 * - if a victory message is received, the end of game is declared in the database.
 *
 *
 * NOTE : when a device wants to play, it initiates a regular request each second asking for updates in the new game.
 *            This file answers to those request by sending them all data about the current game.
 */

if (
    (isset($_GET['message']) && !empty($_GET['message']))
 && (isset($_GET['playerId']) && !empty($_GET['playerId']))
){
    switch (strval($_GET['message'])){
        case 'is_console_verbose':
            echo loadConfiguration()['verbose_mode'];
            break;
        case 'what_is_the_chosen_language':
            echo loadConfiguration()['language'];
            break;
        case 'i_want_to_start_a_game':
            echo canIStart($_GET['playerId']);
            break;
        case 'check_updates':
            echo json_encode(getUpdates($_GET['playerId']));
            break;
        case 'i_scored':
            if( isset($_GET['score']) ){
                updatePlayerScore($_GET['playerId'], $_GET['score']);
            }
            break;
        case 'a_card_has_been_played':
            // When a card is played, we must record it.
            if( isset($_GET['cardPlayed']) ){
                recordPlayedCard($_GET['playerId'], $_GET['cardPlayed']);
            }
            break;
        case 'i_won':
            declareGameAsFinished();
            break;
        default:
            echo 'an unknown message has been sent to me.';
            break;
    }
}
else{
    echo 'Error : your request must contain at least an identifier and a message.';
}


 /**
  * Declares the game as finished in the database.
  */
function declareGameAsFinished(){
    $db = new DataBaseConnection();
    $lastEntryGame = $db->getLastEntry();
    $db->declareEndOfGame($lastEntryGame['id_game']);
}


 /**
  * Records the score of a certain player using its id.
  * @param string $idPlayer
  * @param int $scorePlayer
  */
function updatePlayerScore($idPlayer='', $scorePlayer=0){
    $db = new DataBaseConnection();
    $lastEntryGame = $db->getLastEntry();

    if($lastEntryGame['player1'] == $idPlayer){
        $db->updatePlayer1Score($scorePlayer, $lastEntryGame['id_game']);
    } else{
        $db->updatePlayer2Score($scorePlayer, $lastEntryGame['id_game']);
    }
}



 /**
  * Each time a card is played, this function is called. Its endeavour is to record all played cards and if they have
  * already been sent to the opponent.
  * @param string $playerId
  * @param string $urlPlayedImage
  */
function recordPlayedCard($playerId='', $urlPlayedImage=''){
    $db = new DataBaseConnection();
    $lastEntryGame = $db->getLastEntry();

    if($lastEntryGame['player1'] == $playerId){

        if($lastEntryGame['player1_played_cards']==null){ // No card has been recorded yet.
            $playedCards = array();
        } else{
            $playedCards = json_decode($lastEntryGame['player1_played_cards'], true);
        }
        array_push($playedCards, array($urlPlayedImage,false)); // False means the card has not been shown to the other player yet.
        $db->updatePlayedCards(1, json_encode($playedCards), $lastEntryGame['id_game']);
    } else{
        if($lastEntryGame['player2_played_cards']==null){ // No card has been recorded yet.
            $playedCards = array();
        } else{
            $playedCards = json_decode($lastEntryGame['player2_played_cards'], true);
        }
        array_push($playedCards, array($urlPlayedImage,false)); // False means the card has not been shown to the other player yet.
        $db->updatePlayedCards(2, json_encode($playedCards), $lastEntryGame['id_game']);
    }
}




 /**
  * We want these informations :
  * - is the game finished ? (i.e. if the other player has already finished)
  * - what is the other player's score ?
  * - which cards do the other player chose to reveal ?
  * @param string $askingPlayerId
  * @return array
  */
function getUpdates($askingPlayerId=''){
    $db = new DataBaseConnection();
    $lastEntryGame = $db->getLastEntry();

    $updates['is_game_finished'] = $lastEntryGame['is_game_finished'];

    $updatedCards = array();
    if($askingPlayerId == $lastEntryGame['player1']){ // The player 1 wants player 2's data.
        $updates['otherPlayerScore'] = $lastEntryGame['player2_score'];
        $updates['lastRevealedCards'] = json_decode($lastEntryGame['player2_played_cards'], true);
        // Sets all played cards as revealed.
        if ($updates['lastRevealedCards'] == null){
            $updates['lastRevealedCards'] = array();
        }
        foreach ($updates['lastRevealedCards'] as $card){
            array_push($updatedCards, array($card[0], true));
        }
        $db->updatePlayedCards(2, json_encode($updatedCards), intval($lastEntryGame['id_game']));

    } else{ // The player 2 wants player 1's data.
        $updates['otherPlayerScore'] = $lastEntryGame['player1_score'];
        $updates['lastRevealedCards'] = json_decode($lastEntryGame['player1_played_cards'], true);
        if ($updates['lastRevealedCards'] == null){
            $updates['lastRevealedCards'] = array();
        }
        // Sets all played cards as revealed.
        foreach ($updates['lastRevealedCards'] as $card){
            array_push($updatedCards, array($card[0], true));
        }
        $db->updatePlayedCards(1, json_encode($updatedCards), intval($lastEntryGame['id_game']));

    }
    return $updates;
}


/**
 * Can we give to the asking player the signal to start playing ?
 * @param string $playerId The id of the demanding player.
 * @return string WAIT|ERROR|json_pairs
 */
function canIStart($playerId=''){
    $playerId = htmlentities($playerId, ENT_QUOTES);
    $db = new DataBaseConnection();
    $lastEntryGame = $db->getLastEntry();

    if(!$lastEntryGame OR $lastEntryGame['is_game_finished']=='1'){ // empty database OR last game is finished -> create a brand new game.
        $db->createNewGame($playerId);
        return 'WAIT';
    } elseif($lastEntryGame['player1']==$playerId OR $lastEntryGame['player2']==$playerId){ // Player already recorded as waiting for a new game.
        // Is the other player already recorded too ?
        if($lastEntryGame['player1']==null OR $lastEntryGame['player2']==null){ // The other player is not here -> WAIT
            return 'WAIT';
        } else{ // The other player is already recorded -> give the cards
            if($lastEntryGame['list_of_cards']==null){
                $cards = json_encode(selectCards());
                $db->startGame($cards, $lastEntryGame['id_game']);
                return $cards;
            } else{
                return $lastEntryGame['list_of_cards'];
            }
        }
    } else{ // Player not recorded in the new game -> insert him in the current game, declare game as started and give him cards.

        // But what if the player is not recorded because the last game was not finished and has been canceled ?
        if($lastEntryGame['is_game_finished']=='0' AND $lastEntryGame['has_game_started']=='1'){
            $db->createNewGame($playerId);
            return 'WAIT';
        } else{
            if($lastEntryGame['list_of_cards']==null){
                $cards = json_encode(selectCards());
                $db->startGameAsPlayer2($playerId, $cards, $lastEntryGame['id_game']);
                return $cards;
            } else{
                return $lastEntryGame['list_of_cards'];
            }
        }
    }
}


/**
 * Take 9 pairs from the folder chosen in the configuration file.
 */
function selectCards(){
    /*
     * To select cards properly, we have to :
     * - read in the configuration.json which set of cards we have to use.
     * - check the available pairs of cards.
     * - pick randomly 9 pairs and place them shuffled in the database.
     */

    // Get the correct directory containing my dataset.
    $pathToMyDataset = loadConfiguration()['dataset_directory'] . '/' . loadConfiguration()['chosen_dataset_sub-folder'] . '/';
    // Check all sub-folders.
    $chosenFolderContent = scandir(__DIR__ . '/' . $pathToMyDataset);
    $pairs = array();
    foreach ($chosenFolderContent as $subFolder) {
        if($subFolder!='.' && $subFolder != '..' && is_dir(__DIR__ . '/' . $pathToMyDataset . $subFolder)){
            // For each sub-folder, we have to check now if they contain two images
            if(file_exists(__DIR__ . '/' . $pathToMyDataset . $subFolder . '/0.jpg') &&
                file_exists(__DIR__ . '/' . $pathToMyDataset . $subFolder . '/1.jpg')
            ){
                // A pair has been found in this folder.
                array_push($pairs, array($pathToMyDataset . $subFolder . '/0.jpg', $pathToMyDataset . $subFolder . '/1.jpg'));
            }
        }
    }
    // We have all our pairs. Are they enough (more han 9) ?
    if(sizeof($pairs)>8){
        $listOfCards = array();
        shuffle($pairs);
        foreach (array_slice($pairs, 0, 9) as $pair) {
            array_push($listOfCards, $pair[0]);
            array_push($listOfCards, $pair[1]);
        }
        shuffle($listOfCards); // We have now all our cards shuffled in a pile.
        return $listOfCards;
    } else{
        return 'ERROR 3'; // not enough pairs of cards.
    }
}


/**
 * Just load the configuration.json file and make it an associative array. Then returns that array.
 * @return array
 */
function loadConfiguration(){
    return json_decode(file_get_contents('configuration.json'), true);
}