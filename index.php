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
    /*
     * In this case, wa have to see if i already have received a demand from the other player.
     * We read the player_queue.txt.
     * - if it is empty, we add the current id inside and we respond WAIT.
     * - if it is not empty but contains the same id , we respond WAIT.
     * - if it is not empty and contains not the same id, we add the id and we respond START.
     * - if it is not empty and contains two ids including the current one AND we respond START .
     */
    try {
        $playersFileContent = file_get_contents('player_queue.txt');
        $idsInFile = explode("\n", $playersFileContent);
        //var_dump($idsInFile);
        if (sizeof($idsInFile) == 1){ // Empty file OR one line filled.
            // Is the file empty ?
            if ($playersFileContent==''){
                file_put_contents('player_queue.txt', $playerId);
                return 'WAIT';
            } elseif ($playersFileContent == $playerId){ // Our current id is already inside and alone.
                return 'WAIT';
            }
            else{ // our current id is not inside and another one is already in.
                file_put_contents('player_queue.txt', "\n" . $playerId, FILE_APPEND);
                // So it is a brand new game. Let's pck here the cards to play with.
                return selectCards();
            }
        } elseif (sizeof($idsInFile) == 2){ // Two lines filled.
            if(in_array($playerId, $idsInFile)){ // Two lines in the file and the current id is in.
                return selectCards();
            } else{
                return 'ERROR 1'; // two lines but we are not in !
            }

        } else{
            return 'ERROR 0'; // Error : two much data in the file.
        }
    } catch (Exception $e){
        //echo $e;
        return 'ERROR'; // error reaching the file
    }
}


/**
 * Take 9 pairs from the folder chosen in the configuration file.
 * @return array
 */
function selectCards(){
    /*
     * To select cards properly, we have to :
     * - read in the configuration.json which set of cards we have to use.
     * - check the available pairs of cards
     * - pick randomly 9 pairs.
     * - return that pairs in a json string
     */
    $pairsOfCards = '{';

    // Check the folder's chosen set of images.
    $datasetFolder = loadConfiguration()['dataset_directory'];
    $datasetChosen = loadConfiguration()['chosen_dataset_sub-folder'];

    // Check all sub-folders.
    $chosenFolderContent = scandir(__DIR__ . '/' . $datasetFolder . '/' . $datasetChosen);
    $pairNumber = 0;
    foreach ($chosenFolderContent as $subFolder) {
        if( $pairNumber<9 && $subFolder!='.' && $subFolder != '..' && is_dir(__DIR__ . '/' . $datasetFolder . '/' . $datasetChosen . '/' . $subFolder)){
            // For each sub-folder, we have to check now if they contain two images
            //var_dump(scandir(__DIR__ . '/' . $datasetFolder . '/' . $datasetChosen . '/' . $subFolder));
            if(file_exists(__DIR__ . '/' . $datasetFolder . '/' . $datasetChosen . '/' . $subFolder . '/0.jpg') &&
                file_exists(__DIR__ . '/' . $datasetFolder . '/' . $datasetChosen . '/' . $subFolder . '/1.jpg')
            ){
                // A pair has been found in this folder.
                $pairsOfCards .= '"' . $pairNumber . '":[ "' . $datasetFolder . '/' . $datasetChosen . '/' . $subFolder . '/0.jpg", "' . $datasetFolder . '/' . $datasetChosen . '/' . $subFolder . '/1.jpg" ]';
                if($pairNumber<8){
                    $pairsOfCards .= ',';
                }
                $pairNumber++;
            }
        }
    }
    $pairsOfCards .= '}';
    return $pairsOfCards;
    // todo make it chose randomly the 9 pairs among those available.
    //return array_slice($pairsOfCards, 0, 9); // todo check if it is at least 9 long !
}

/**
 * Just load the configuration.json file and make it an associative array. Then returns that array.
 * @return array
 */
function loadConfiguration(){
    return json_decode(file_get_contents('configuration.json'), true);
}