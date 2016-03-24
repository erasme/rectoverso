# Recto-Verso

Simple server using Nodejs & socket.io

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
Méthode manuelle à faire à chaque démarrage (TODO : à automatiser)
Issu de http://ubuntuforums.org/showthread.php?t=1493407&p=9380642#post9380642 (essayer différentes combinaisons selon la rotation souhaitée)

* Dans la console : `xinput list`
* Noter l'id du TouchScreen
* Dans la console : `xinput set-prop xx "Evdev Axis Inversion" 1, 0` avec xx l'id du TouchScreen
* Dans la console : `xinput set-prop xx "Evdev Axes Swap" 1`