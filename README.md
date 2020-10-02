# Recto-Verso

## Presentation

Recto-Verso is a prototype making 


## Usage



## Installation

### Requirements


### Main server


make sure data folder has writing rights

### Secondary devices




todo : documentation of
- configuration of the application
- add/modify/choose a language
- document how to set up the screen vertically
- check everything in the github depot (desciption/actions/projects...
- img folder -> what is used ? 

Only tested on linux Ubuntu (shall work on other linux though).

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