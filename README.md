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

todo save the old node.js application version in a different branch.

## TODO

Les paires choisies dans la version ajax ne sont pas aléatoires (urgence oblige).
todo : placer toutes les infos côté serveur dans un fichier les regroupant toutes (json ?)


## But de l'application

Recto-Verso a pour but de connecter deux bornes entre elles pour permettre à deux joueurs de jouer
à un jeu de mémoire avec des cartes à retourner par paires. (type [Mémory](https://fr.wikipedia.org/wiki/Memory_(jeu)))


## Fonctionnement général de l'application

Pour le moment, et par souci de simplification, trois machines sont nécessaires.
- une machine-serveur qui sera le maître du jeu
- deux machines-joueuses au code strictement identique

### Actions côté machine serveur

La machine-serveur doit gérer plusieurs choses :
1. attendre un message de départ de la part des deux machines-joueuses et leur répondre en même temps qu'elles
peuvent commencer
1. attendre un message de la part d'une des machines-joueuses annonçant qu'elle a fini et envoyer à l'autre
machine-joueuse qu'elle a perdu


### Actions côté machines-joueuses

Les machines joueuses ont strictement le même comportement. Elles doivent :
- requêter en Ajax la machine-serveur si elles veulent jouer
- dire en Ajax à la machine-serveur si elles ont gagné

## Installation

### SUr la machine-serveur

todo

### Sur les machines-joueuses

todo

## Cas d'utilisation

### Modify datasets general folder

todo : explain configuration file

### Modifier le jeu de données

Vous pouvez avoir plusieurs jeux de données d'images. Pour en changer, placez un dossier contenant ces
images sur la machine-serveur dans le dossier `images/`. Puis modifiez le fichier _configuration.json_
situé à la racine.
```json
{
  "image_directory": "images_rectoverso" 
}
```

### Informations sur les jeux de données

- todo : formats acceptés
- todo : organisation  de l'arborescence du dossier
- todo : quantité de paires acceptées
- todo : changer la langue de l'application
- todo : ajouter une nouvelle traduction
- todo : explain all possibilities in the configuration.json

## Installation

git pull
chmod 777 sur player_queue.txt



## TODOS 

- Use sqlite instead of json file...
- when a pair of cards has been correctly fount, give them an appropriate design ie the fount pairs are clearly distinct of played cards.