# Recto-Verso

## Description 
Description du projet

En utilisant les photos d'Instagram publiées avec le mot-clé #JeanMacé, Recto Verso confronte les différentes perceptions de ce quartier lyonnais. Les joueurs découvrent donc des points de vue variés, de ce lieu de vie qu'ils partagent avec d'autres habitants, ou des gens de passage. 

- [Flickr : photos d'Erasme avec #rectoverso](https://www.flickr.com/search/?safe_search=1&tags=rectoverso&user_id=23883279%40N05&view_all=1)


Simple server using Nodejs & socket.io

## Setup room

### Create new room

1. Create a new folder inside `public` folder: your folder's name will be the alias to your room.
2. Create a new `cards` folder inside yours`
3. Create a new `default` folder inside your `cards` folder
4. Put your pairs of images inside `0`, `1`, `2`, `3`… folders and name your images `0.jpg` and `1.jpg` inside each folder

### Create sub-rooms for any room

1. Create a new folder inside your `public/yourproject/cards/` next to `public/yourproject/cards/default/`: your folder's name will be the alias to your sub-room
2. Duplicate the file `public/default/index.ejs` to `public/yourproject/index.ejs`
3. Modify this `index.ejs` so you can make buttons that use sub-rooms cards

## Setup Instagram

### Create Instagram token

1. Obtain an Instagram token: [follow this tutorial](http://jelled.com/instagram/access-token)
2. Authorize the client : https://instagram.com/oauth/authorize/?client_id=YOUR_TOKEN&redirect_uri=http://localhost&response_type=token&scope=likes+comments+relationships+basic+public_content
3. save the token in the URL

### GET Location ID

1. Select Lat/Long
2. Get the list of locations via API : https://api.instagram.com/v1/locations/search?lat=LAT&lng=LNG&access_token=YOUR_TOKEN
3. copy the id

    {
    latitude: 48.85867696,
    id: "274044375",
    longitude: 2.294464218,
    name: "la Tour Eiffel"
    }

### Get recent images by location ID

https://api.instagram.com/v1/locations/LOCATION_ID/media/recent?access_token=YOUR_TOKEN


### Integrate Instagram to the server

https://www.npmjs.com/package/instagram-node

# Setup screens

## Retourner l'écran Ubuntu / écran de droite
Lien du tutoriel [en anglais] : https://www.thefanclub.co.za/how-to/how-ubuntu-1204-touchscreen-calibration

* Paramètres système > Affichage > Rotation > Sens antihoraire > Appliquer
* Installler uTouch : `sudo apt-get install utouch`
* Installer xinput calibrator : `sudo apt-get install xinput-calibrator`
* Lancer Calibrate Touchscreen et toucher les 4 croix l'une après l'autre
* Faire `sudo gedit /usr/share/X11/xorg.conf.d/10-evdev.conf`
* Coller les valeurs trouvées dans le terminal de Calibrate Touchscreen commençant par Option dans la dernière section

## Retourner l'écran Ubuntu / écran de gauche
Issu de http://ubuntuforums.org/showthread.php?t=1493407&p=9380642#post9380642 (essayer différentes combinaisons selon la rotation souhaitée)

* Dans la console : `xinput list`
* Noter l'id du TouchScreen

Script lancé à chaque démarrage  
`xinput set-prop xx "Evdev Axis Inversion" 1, 0` avec xx l'id du TouchScreen  
`xinput set-prop xx "Evdev Axes Swap" 1`  
`firefox yyyy.zz` avec yyyy.zz l'url du jeu

## RectoVerso aujourd'hui
-----------
- RectoVerso fonctionne actuellement sur les deux bornes RV
- Le jeu est à jour sur le GitHub
- Le jeu est adapté à une résolution de 1920x1080 uniquement : tout affichage en dessous de ces dimensions/ratio sera sans doute déceptif. 
*=> UPGRADE : version responsive du jeu*
- Le serveur du jeu tourne sur un des deux Zotac (urbanlab17-zmi.local)
- Le dispositif complet n'a pas besoin d'une connexion à Internet
- Les deux bornes doivent être connectées sur le même réseau local (en filaire par un switch ou en wi-fi à un point d'accès) (pas besoin d'Internet sur le réseau) pour communiquer entre elles 
*=> UPGRADE : connexion Ad Hoc*
- Au besoin, les deux bornes peuvent être connectées via Internet : dans ce cas, il faut mettre en place un serveur en ligne 
- Les deux bornes ne se lancent pas toutes seules au boot, il faut ouvrir un Terminal et taper `/home/erasme/Bureau/rectoverso_2_demarrage.sh`
*=> UPGRADE : lancer le script `/home/erasme/Bureau/rectoverso_2_demarrage.sh` au boot du Linux*

### Pour lancer le serveur socket sur `lab.erasme.lan`
1. Se connecter en SSH sur erasme@lab.erasme.lan (user: erasme | pass: t…) PS : le projet se trouve `var/www/rectoverso/rectoverso`

2. Entrer ``service rectoverso start``

3. Chaque écran doit afficher la page ``rectoverso.erasme.org/laroom`` ou ``lab.erasme.lan:5000`` sous Chromium

### Mettre en place RV sur les bornes

2.a. Une fois connecté au réseau filaire, aller dans Modifier la connexion puis dans l'onglet IPv4 modifier l'adressage Automatique en Partager avec d'autres ordinateurs

2.b. Constater que l'icône de connexion en haut à droite de Ubuntu est devenue deux flèches haut/bas. Si ce n'est pas le cas, redémarrer l'ordi puis se reconnecter au réseau filaire Ethernet

3. Cliquer sur l'icône de connexion (deux flèches haut/bas) puis sur Informations de connexion

4. Lancer le serveur Rectoverso via `node index.js` à la racine du dossier du projet (normalement : `/home/erasme/projets/rectoverso`)

5. Lancer le script d'exécution `lancer-rectoverso.sh` en double-cliquant ou clic droit > ouvrir avec > lancer le logiciel

### Mettre à jour Rectoverso sur la borne serveur

1. Identifier l'ordinateur serveur

2. Aller dans l'icône de connexion en haut à droite et décocher `Activer le Wifi` puis se connecter au filaire : si ça fonctionne, tant mieux ; sinon, redémarrer l'ordinateur et constater que le Wifi fonctionne

3. Ouvrir le Terminal et aller dans le dossier racine du projet (normalement `/var/www/projets/rectoverso`)

4. Respirer un grand coup et taper `git pull` puis Entrée

5. Une fois que la mise à jour est faite, relancer le dispositif

### Pour que rectoverso se lance au démarrage

Déposer sur le bureau de la machne le script rectoverso_2_demarrage.sh (situé dans "rectoverso/scripts")

Ouvrir le terminal

`chmod +x lab_monitoring`

`chmod +x lab_monitoring/utils`

`chmod +x lab_monitoring/utils/forDevices`

`chmod +x lab_monitoring/utils/forDevices/handleRotatedScreen.sh`

`chmod +x /home/erasme/Bureau/rectoverso_2_demarrage.sh`

Dans le mode de recherche ubuntu taper "application" et ouvrir "Applications au démarrage"

Dans la pop-up qui s'ouvre, cliquer sur "Ajouter"

Remplir les champs Nom:"au choix", Commande:"`/home/erasme/Bureau/rectoverso_2_demarrage.sh` Commenatire:"au choix"

Si besoin, supprimer la clé de trousseau en tapant "trousseau" dans le mode de recherche, ouvrir "Mots de passe et clés", clic droit sur l'onglet "connexion" à gauche, "modifier le mot de passe". Là entrer le mot de passe actuel et laisser un mot de passe vide pour le nouveau mot de passe.

## Maintenance

Nav privée par défaut pour empêcher les notifications de restauration de session :**

- ``sudo nano /etc/chromium-browser/default``
- Changer ``CHROMIUM_FLAGS ="--incognito"``

Empêcher clique long/droit
Télécharger module : https://chrome.google.com/webstore/detail/context-menu-blocker/gomhdignfhgeamkdgnhaimjigoppgihh
(Ou consigne ici : http://stackoverflow.com/questions/28222548/how-to-disable-context-menu-on-right-click-long-touch-in-a-kiosk-mode-of-chrome)
