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


## Integrate Instagram to the server

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

RectoVerso aujourd'hui
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



## Maintenance

Nav privée par défaut pour empêcher les notifications de restauration de session :**

- ``sudo nano /etc/chromium-browser/default``
- Changer ``CHROMIUM_FLAGS ="--incognito"``

Empêcher clique long/droit
Télécharger module : https://chrome.google.com/webstore/detail/context-menu-blocker/gomhdignfhgeamkdgnhaimjigoppgihh
(Ou consigne ici : http://stackoverflow.com/questions/28222548/how-to-disable-context-menu-on-right-click-long-touch-in-a-kiosk-mode-of-chrome)
