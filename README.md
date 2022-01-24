[![CircleCI](https://circleci.com/gh/1024pix/pix/tree/dev.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/1024pix/pix) PIX EDITOR
===

Présentation
------------

[PIX](https://pix.fr) s’adresse à tous les citoyens francophones (élèves, étudiants, professionnels, décrocheurs, demandeurs d’emploi, séniors, citoyens) qui souhaitent mesurer, développer et valoriser leurs compétences numériques.

Le service se présente sous la forme d’une plateforme en ligne d’évaluation et de certification des compétences numériques.

Le but de PIX est de susciter l’envie de se former tout au long de la vie en proposant des méthodes d’évaluation innovantes, exigeantes et bienveillantes ainsi que des recommandations de formations ciblées.

Pix Editor propose une interface pour lire et modifier le référentiel de contenu pédagogique.

Installation
------------

### Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

* [Git](http://git-scm.com/) (2.6.4)
* [Node.js](http://nodejs.org/) (v14.17.x) et NPM (6.14.x)
* [Docker](https://docs.docker.com/get-started/) (19.03.5) avec [Docker Compose](https://docs.docker.com/compose/install/)

⚠️ Les versions indiquées sont celles utilisées et préconisées par l'équipe de développement. Il est possible que l'application fonctionne avec des versions différentes.

> Les versions indiquées sont celles préconisées pour un bon fonctionnement de l'application.

#### Airtable

Pix-editor utilise [Airtable](https://airtable.com/). La structure de la base peut être fournie en contactant l'équipe de développement.

### Instructions

**1/ Récupérer le code source**

```bash
$ git clone git@github.com:1024pix/pix-editor.git && cd pix-editor
```

**2/ Créer un un fichier .env**

Copier le sample.env situer à la racine et le renommer en .env:
```bash
cp api/sample.env api/.env
```

Remplir les valeurs des variables dans le fichier `.env`.

> La description et le format attendu de chaque option/variable est documentée dans le fichier `sample.env`.

**3/ Installer les dépendances**

Sur api:
```bash
cd api
$ npm ci
```

Sur pix-editor:
```bash
cd pix-editor
$ npm ci
```

**4/ Lancer, configurer et initialiser la base de données**

```bash
docker-compose up -d
(cd api && npm run db:reset)
```

**5/ Lancer l'application**

Dans un premier processus ou terminal, depuis le répertoire `~/api`:
```bash
cd api
$ npm start
```

Dans un premier processus ou terminal, depuis le répertoire `~/pix-editor`:
```bash
cd pix-editor
$ npm start
```

**6/ Accéder à l'application**

[l'API](http://localhost:3002) tourne en local sur le port 3002.
[l'application Pix-Editor](http://localhost:4300) sur le port 4300.


Licence
-------

Ce logiciel et son code source sont distribués sous [licence AGPL](https://www.gnu.org/licenses/why-affero-gpl.fr.html).
