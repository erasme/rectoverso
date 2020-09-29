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

    /**
     * DataBaseConnection constructor. Blanked to override any default behavior.
     */
    public function __construct()
    {

    }

    /**
     * Get the DB Connector.
     * @return PDO
     */
    public function getDBConnection(){
        $pdo = false;
        try{
            $pdo = new PDO('sqlite:'.dirname(__FILE__).'/rectoverso.sqlite');
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(Exception $e) {
            echo "Impossible d'accéder à la base de données SQLite : ".$e->getMessage();
            die();
        }
        return $pdo;
    }
}