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

/*
 * Pour une compréhension globale du fonctionnement du prototype, référez-vous eu readme.md
 *
 * Cette page contient le code du serveur. Celui-ci doit suivre l'algorithme suivant :
 *
 * - charger le fichier de la configuration voulue (configuration.json).
 * - attendre de recevoir un signal de départ voulu par les deux machines-joueuses.
 * - si deux messages de départ ont été émis, le serveur leur répondra que le jeu peut commencer tout en fournissant
 * les données d'image.
 * - si un message de victoire est envoyé par une des machines-joueuses, on annonce à l'autre qu'elle a perdu.
 *
 *
 * NOTE : quand une machine-joueuse désire jouer, elle fait un appel Ajax toutes les secondes et c'est lors de la
 * réponse à ces requêtes qu'on peut leur faire passer des messages comme les images ou les notification de victoire.
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
        case 'is_game_finished':
            $endGame = file_get_contents('gameFinished.txt');
            if($endGame=='true'){
                echo 'true';
                // Game is finished. Let's restart everything.
                eraseAllData();
            } else{
                echo 'false';
            }
            break;
        case 'i_won':
            echo file_put_contents('gameFinished.txt', 'true');
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
 *When a game is finished, we should make text files back to normal.
 */
function eraseAllData(){
    sleep(3);
    // state game back to false.
    file_put_contents('gameFinished.txt', 'false');
    // player ids back to empty
    file_put_contents('player_queue.txt', '');
}


/**
 * Can we give to the asking player the signal to start playing ?
 * @param string $playerId The id of the demanding player.
 * @return string WAIT|ERROR|json_pairs
 */
function canIStart($playerId=''){
    $playerId = htmlentities($playerId, ENT_QUOTES);

    try {
        // Let's test all cases.
        $gameData = json_decode(file_get_contents('current_game.json'), true);

        // Both slots are free.
        if($gameData['player_1']['id'] == '' AND $gameData['player_2']['id'] == ''){
            // Subscribe the user in the file.
            $gameData['player_1']['id'] = $playerId;
            file_put_contents('current_game.json', json_encode($gameData), LOCK_EX);
            // And we can already select the cards.
            selectCards();
            echo 'WAIT';
            return;
        }

        // Already inside
        elseif($gameData['player_1']['id'] == $playerId OR $gameData['player_2']['id'] == $playerId){
            // And a slot is sill free.
            if($gameData['player_1']['id'] == '' OR $gameData['player_2']['id'] == ''){
                echo 'WAIT';
                return;
            }
            // And the other slot is not free.
            else{
                // todo send cards ? or start only with loading cards later ?
                return;
            }
        }
        // Not inside.
        else{
            // And there is still a free slot.
            if($gameData['player_1']['id'] == '' OR $gameData['player_2']['id'] == ''){
                if($gameData['player_1']['id'] == ''){
                    $gameData['player_1']['id'] = $playerId;
                } else{
                    $gameData['player_2']['id'] = $playerId;
                }
                file_put_contents('current_game.json', json_encode($gameData), LOCK_EX);
                // todo send cards ? or start only with loading cards later ?
                return;
            }
            // And there is no free slot. WHAAAAAAAAT-> big problem. -> throw error
            else{
                var_dump(selectCards());
                echo 'ERROR 1';
            }
        }
    } catch (Exception $e){
        echo 'ERROR 2';
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
     * - pick randomly 9 pairs and place them in the current_game.json .
     * - place a shuffled ordre of cards in the current_game.json file.
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

        // Let's record it in the current_game data.
        $gameData = json_decode(file_get_contents('current_game.json'), true);
        $gameData['cards'] = $listOfCards;
        file_put_contents('current_game.json', json_encode($gameData), LOCK_EX);
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