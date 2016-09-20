### Installation en tant que service sur Ubuntu

#### Poser le script 'rectoverso' dans le répertoire /etc/init.d de la machine (droits administrateurs nécessaires).
#### Creer les répertoires nécessairee au fonctionnement sur script de démarrage

`sudo mkdir /var/run/rectoverso`
`sudo mkdir /var/log/rectoverso`
`sudo chown erasme:erasme /var/run/rectoverso`
`sudo chown erasme:erasme /var/log/rectoverso`

#### Prise en compte du script par système.
`sudo update-rc.d rectoverso defaults`
`sudo update-rc.d rectoverso enable`
