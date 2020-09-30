<?php
/**
 * @author : Pierre-Alexandre Racine (pierrealexandreracine -at(@)- gmail -dot(.)- com)
 * @owner : ERASME (https://www.erasme.org/)
 * @copyright : ERASME (https://www.erasme.org/)
 * @license  : ALFERO GPL ( https://www.gnu.org/licenses/agpl-3.0.fr.html )
 * Project : TODO
 * Date: 29/09/2020
 * Time: 10:02
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class DataBaseConnection
{
    protected $connection;

    /**
     * DataBaseConnection constructor. Blanked to override any default behavior.
     */
    public function __construct()
    {
        $this->connection = new PDO('sqlite:'.dirname(__FILE__).'/rectoverso.sqlite');
        $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    private function __clone()
    {
    }

    static public function getInstance()
    {
        if (! (self::$instance instanceof self))
        {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Sends the data about the last played (or current) game.
     * @return mixed
     */
    public function getLastEntry(){
        try {
            $lastEntry = $this->connection->prepare("SELECT * FROM games ORDER BY id_game DESC LIMIT 1");
            $lastEntry->execute(array());
            $lastEntry = $lastEntry->fetch();
        } catch (Exception $e){
            $lastEntry = $this->getLastEntry();
        }
        return $lastEntry;
    }


    public function startGame($cards='', $idGame=1){
        $newGame = $this->connection->prepare("UPDATE games SET list_of_cards=:cards, has_game_started=:startGame WHERE id_game=:id_game");
        $newGame->execute(array(
            'startGame'=> true,
            'cards'    => $cards,
            'id_game'  => $idGame,
        ));
    }

    public function startGameAsPlayer2($playerId='', $cards='', $idGame=1){
        $newGame = $this->connection->prepare("UPDATE games SET player2=:player2, has_game_started=:startGame, list_of_cards=:cards WHERE id_game=:id_game");
        $newGame->execute(array(
            'player2'  => $playerId,
            'startGame'=> true,
            'cards'    => $cards,
            'id_game'  => $idGame,
        ));
    }


    public function createNewGame($playerId=''){
        $newGame = $this->connection->prepare("INSERT INTO games (player1) VALUES (:player1)");
        $newGame->execute(array(
            'player1'=> $playerId,
        ));
    }


    public function updatePlayedCards($playerNumber=1, $cards='', $idGame=1){
        try {
            if($playerNumber==2){
                $update = $this->connection->prepare("UPDATE games SET player2_played_cards=:player2_played_cards WHERE id_game=:id_game");
                $update->execute(array(
                    'player2_played_cards' => $cards,
                    'id_game'              => $idGame,
                ));
            } else{
                $update = $this->connection->prepare("UPDATE games SET player1_played_cards=:player1_played_cards WHERE id_game=:id_game");
                $update->execute(array(
                    'player1_played_cards' => $cards,
                    'id_game'              => $idGame,
                ));
            }
        }catch (Exception $e){
            $this->updatePlayedCards($playerNumber, $cards, $idGame);
        }

    }

}