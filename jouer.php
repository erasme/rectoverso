<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">

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

<body>

    <div id="block_containing_all_cards">

    </div>

    <div id="block_containing_modal_box_for_messages">
        <button id="message_to_user" onclick="askForGame();">Commencer !</button>
    </div>



<!--
<div class="Screen">
    <a href="#" onclick="location.reload();" style="position:absolute;top:0;right:0;width:50px;height:50px;z-index:100000000000000000000"></a>


    <div class="State inactive" data-background-color>

        <section class="Bloc inactive">
            <img class="Logo StateTransition" src="/assets/<%= room %>/img/Logo.svg">
            <img class="LogoText StateTransition" src="/assets/<%= room %>/img/LogoText.svg">
        </section>

        <div class="NavButtons inactive StateTransition">
            <div class="Tap" data-folder="" data-pairs="">Démarrer</div>
        </div>





        <section class="Bloc rules">
            <div class="TutoDemo">
                <div class="card">
                    <div class="card_wrap">
                        <div class="back"></div>
                        <div class="card_image card_child front" style="background-image:url(/assets/<%= room %>/cards/default/1/1.jpg)"></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card_wrap">
                        <div class="back"></div>
                        <div class="card_image card_child front" style="background-image:url(/assets/<%= room %>/cards/default/2/1.jpg)"></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card_wrap">
                        <div class="back"></div>
                        <div class="card_image card_child front" style="background-image:url(/assets/<%= room %>/cards/default/2/0.jpg)"></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card_wrap">
                        <div class="back"></div>
                        <div class="card_image card_child front" style="background-image:url(/assets/<%= room %>/cards/default/1/0.jpg)"></div>
                    </div>
                </div>
            </div>
            <p class="TutoText TutoTextTop">
                Le principe est simple !<br>
                <br>
                Retrouvez les paires<br>
                de photos similaires<br>
                publiées sur Instagram<br>
                plus vite que votre adversaire<br>
                en retournant les cartes.
            </p>
            <p class="TutoText TutoTextBottom">
                Votre adversaire dispose d’autres paires<br>
                à assembler, et ses actions sont visibles<br>
                sur votre écran. Cela peut ainsi vous aider<br>
                comme vous contraindre.<br>
                <br>
                Bonne chance !
            </p>
            <div class="NavButtons rules StateTransition">
                <div class="Tap">C'est parti !</div>
            </div>

            <div class="StateTransition" id="waiting">
                <h2>Vous êtes prêt(e) ?</h2>
                <p>En attente de votre adversaire<br>sur l'autre quai...</p>
            </div>
        </section>




        <section class="Bloc game" data-background-color-score data-background-color>
            <div id="gameCards" class="StateTransition"></div>
            <div id="score" class="StateTransition">
                <div id="foundScore">
                    <div class="scoreCards StateTransition"></div>
                    <div class="scoreNumber">0</div>
                    <div class="scoreLabel StateTransition">Vous</div>
                </div>

                <div id="foundByOtherScore">
                    <div class="scoreCards StateTransition"></div>
                    <div class="scoreNumber">0</div>
                    <div class="scoreLabel StateTransition">Adversaire</div>
                </div>
            </div>
        </section>





        <section class="Bloc gameEnded">
            <div id="win">
                <h2>Bravo, vous avez gagné !</h2>
            </div>

            <div id="lost">
                <h2>Zut, raté pour cette fois…</h2>
            </div>

            <div id="gameEndedCards"></div>

            <div class="NavButtons rejouer">
                <div class="Tap ButtonRejouer">Rejouer</div>
            </div>
        </section>


    </div>

    <div class="Bubble__OtherReady">Votre adversaire est prêt !</div>

    <div class="State" id="cantaccess">
        <div class="colorBg">
            <img id="logo" src="/assets/<%= room %>/img/Logo.svg">
            <h2>
                Zut, il y a déjà <br>deux joueurs<br> sur la room <span class="CantAccessRoom"></span> :)
            </h2>
        </div>
    </div>

</div>
-->
<script type="text/javascript" src="js/scripts.js"></script>
</body>
<script>

</script>
</html>