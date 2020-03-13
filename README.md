[![CircleCI](https://circleci.com/gh/1024pix/pix/tree/dev.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/1024pix/pix) PIX EDITOR
===

Présentation
------------

[PIX](https://pix.fr) s’adresse à tous les citoyens francophones (élèves, étudiants, professionnels, décrocheurs, demandeurs d’emploi, séniors, citoyens) qui souhaitent mesurer, développer et valoriser leurs compétences numériques.

Le service se présente sous la forme d’une plateforme en ligne d’évaluation et de certification des compétences numériques.

Le but de PIX est de susciter l’envie de se former tout au long de la vie en proposant des méthodes d’évaluation innovantes, exigeantes et bienveillantes ainsi que des recommandations de formations ciblées.

Pix Editor propose une interface pour communiquer avec le référentiel de contenu pédagogique.

Installation
------------

### Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

* [Git](http://git-scm.com/) (2.6.4)
* [Node.js](http://nodejs.org/) (v12.14.1) et NPM (6.13.4)
* [Ember CLI](http://ember-cli.com/) (3.15.2)

⚠️ Les versions indiquées sont celles utilisées et préconisées par l'équipe de développement. Il est possible que l'application fonctionne avec des versions différentes.

> Les versions indiquées sont celles préconisées pour un bon fonctionnement de l'application.

### Instructions

**1/ Récupérer le code source**

```bash
$ git clone git@github.com:1024pix/pix-editor.git && cd pix-editor
```

**2/ Installer les dépendances**

Sur api:
```bash
cd api
$ npm install
```

Sur pix-editor:
```bash
cd pix-editor
$ npm install
```

**3/ Lancer l'application**

Sur api:
```bash
cd api
$ npm start
```

Sur pix-editor:
```bash
cd pix-editor
$ npm start
```

**5/ Accéder à l'application**

[l'API](http://localhost:3002) tourne en local sur le port 3002.
[l'application Pix-Editor](http://localhost:4200) sur le port 4200.


Licence
-------

Ce logiciel et son code source sont distribués sous [licence AGPL](https://www.gnu.org/licenses/why-affero-gpl.fr.html).
