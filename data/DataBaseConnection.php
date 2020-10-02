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


    /**
     * Prepares a new game in the database.
     * @param string $cards
     * @param int $idGame
     */
    public function startGame($cards='', $idGame=1){
        try {
            $newGame = $this->connection->prepare("UPDATE games SET list_of_cards=:cards, has_game_started=:startGame WHERE id_game=:id_game");
            $newGame->execute(array(
                'startGame'=> true,
                'cards'    => $cards,
                'id_game'  => $idGame,
            ));
        } catch (Exception $e){
            $this->startGame($cards, $idGame);
        }
    }

    /**
     * Prepares a new game in the database just in case player 1 has been too slow.
     * @param string $playerId
     * @param string $cards
     * @param int $idGame
     */
    public function startGameAsPlayer2($playerId='', $cards='', $idGame=1){
        try{
            $newGame = $this->connection->prepare("UPDATE games SET player2=:player2, has_game_started=:startGame, list_of_cards=:cards WHERE id_game=:id_game");
            $newGame->execute(array(
                'player2'  => $playerId,
                'startGame'=> true,
                'cards'    => $cards,
                'id_game'  => $idGame,
            ));
        } catch (Exception $e){
            $this->startGameAsPlayer2($playerId, $cards, $idGame);
        }
    }

    /**
     * Creates a new game in the database, i.e. a new entry.
     * @param string $playerId
     */
    public function createNewGame($playerId=''){
        try {
            $newGame = $this->connection->prepare("INSERT INTO games (player1) VALUES (:player1)");
            $newGame->execute(array(
                'player1'=> $playerId,
            ));
        } catch (Exception $e){
            $this->createNewGame($playerId);
        }
    }

    /**
     * Updates the cards played by the player given in argument. It is recorded as a stringed json array.
     * @param int $playerNumber
     * @param string $cards
     * @param int $idGame
     */
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

    /**
     * Declares the end of the game, it is a boolean stored in a field.
     * @param $idGame
     */
    public function declareEndOfGame($idGame){
        try {
            $endGame = $this->connection->prepare("UPDATE games SET is_game_finished=:is_game_finished WHERE id_game=:id_game");
            $endGame->execute(array(
                'is_game_finished' => 1,
                'id_game'          => $idGame,
            ));
        }catch (Exception $e){
            $this->declareEndOfGame($idGame);
        }
    }

    /**
     * Updates the player 1's score (an interger).
     * @param $score
     * @param $idGame
     */
    public function updatePlayer1Score($score, $idGame){
        try {
            $newScore = $this->connection->prepare("UPDATE games SET player1_score=:player1_score WHERE id_game=:id_game");
            $newScore->execute(array(
                'player1_score' => $score,
                'id_game'       => $idGame,
            ));
        } catch (Exception $e){
            // If you fail... try again...
            $this->updatePlayer1Score($score, $idGame);
        }
    }


    /**
     * Updates the player 2's score (an interger).
     * @param $score
     * @param $idGame
     */
    public function updatePlayer2Score($score, $idGame){
        try {
            $newScore = $this->connection->prepare("UPDATE games SET player2_score=:player2_score WHERE id_game=:id_game");
            $newScore->execute(array(
                'player2_score' => $score,
                'id_game'       => $idGame,
            ));
        } catch (Exception $e){
            // If you fail... try again...
            $this->updatePlayer2Score($score, $idGame);
        }
    }

}