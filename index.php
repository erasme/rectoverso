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
        default:
            echo 'an unknown message has been sent to me.';
            break;
    }
}
else{
    echo 'Error : your request must contain at least an identifier and a message.' . 'titi' . $_GET['playerId'] . 'toto';
}

/**
 * Can we give to the asking player the signal to start playing ?
 * @param string $playerId The id of the demanding player.
 * @return string WAIT|START
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
                return 'START';
            }
        } elseif (sizeof($idsInFile) == 2){ // Two lines filled.
            if(in_array($playerId, $idsInFile)){ // Two lines in the file and the current id is in.
                return 'START';
            } else{
                return 'ERROR 1'; // two lines but we are not in !
            }

        } else{
            return 'ERROR 0'; // Error : two much data in the file.
        }
    } catch (Exception $e){
        echo $e;
        return 'ERROR'; // error reaching the file
    }

    /*
     *
  } elseif (!empty($playersFileContent)){
            // The file is not empty but is there really two ids ?
            // We must split the string using \n and check if the current id is inside.
            $idsInFile = explode("\n", $playersFileContent);
            if (sizeof($idsInFile) == 1){
                if(in_array($playerId, $idsInFile )){

                }
            }
            file_put_contents('player_queue.txt', '');
            return 'START 2';
            file_put_contents('player_queue.txt', htmlentities($playerId, ENT_QUOTES), FILE_APPEND);
            return 'START 1';


        } else if( !empty($playersFileContent)){

            else{
                return 'ERROR';
            }
        }

     */
}