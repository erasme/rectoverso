<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">

    <link rel="shortcut icon" href="#"> <!-- Just to get rid of the favicon error in the js console. -->
    <link rel="stylesheet" type="text/css" href="css/styles.css">
    <link href='https://fonts.googleapis.com/css?family=Varela+Round' rel='stylesheet' type='text/css'>

    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">

    <title>Recto-Verso</title>
</head>

<!--
  L'algorithme de fonctionnement côté machine-joueuse fonctionne ainsi :
  - création d'un identifiant aléatoire en js qui sera utilisé pour contacter la machine-serveur
  - présentation d'un bouton « jouer » à l'affichage.
  - si ce bouton est pressé, on en préviendra la machine-serveur et on affichera un message « en attente des
  autres joueurs » et on requêtera toutes les secondes la machine-serveur pour savoir si on peut commencer.
  - le message nous permettant de commencer sera accompagné des informations concernant les paires d'images.
  - on créé un affichage permettant de jouer avec ces cartes.
  - l'utilisateur peut jouer -> documentation dans le fichier js
  - dès que le jeu commence, on requête toutes les secondes la machine-serveur pour savoir si l'autre joueur a déjà fini.
  - si une des requêtes envoyées chaque seconde nous répond qu'on a perdu, on l'affiche au joueur et on arrête de
  requêter toutes les secondes
  - si on a fini sans recevoir de signal de défaite, on prévient la machine-serveur et on affiche un message de victoire
  au joueur et on arrête de requêter.
-->

<body onload="createIdentifier();getModes();loadTranslations();">
    <div id="block_containing_modal_box_for_messages" class="modal active">
        <div class="logo">
            <img src="medias/Logo.svg">
            <img src="medias/LogoText.svg">
        </div>
        <p class="status" id="textModalBox"></p>
        <button id="message_to_user" class="start" onclick="askForGame();"></button>
    </div>
    <div id="block_containing_all_cards" class="container">
        <div id="card_0" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_1" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_2" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_3" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_4" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_5" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_6" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_7" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_8" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_9" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_10" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_11" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_12" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_13" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_14" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_15" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_16" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
        <div id="card_17" class="flip-card">
            <div class="flip-card-inner" onclick="selectCard(this);">
                <div class="flip-card-front" style="background-image: url('medias/CardFront.svg')">
                </div>
                <div class="flip-card-back"  >
                </div>
            </div>
        </div>
    </div>

    <div class="game_status">
        <div class="identifier orange"></div>
        <div class="player"><p><span id="player_1"></span></p></div>
        <div class="points"><p><span id=p1>0</span> - <span id=p2>0</span></p></div>
        <div class="player"><p><span id="player_2"></span><p></div>
        <div class="identifier blue"></div>
    </div>

<script type="application/json" src="translations.json"></script>
<script type="application/javascript" src="js/scripts.js"></script>
</body>
</html>