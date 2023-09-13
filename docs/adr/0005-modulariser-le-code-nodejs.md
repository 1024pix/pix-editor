# 5. Modulariser le code NodeJS

Date : 2023-09-13

## État

Accepté

## Contexte

Sur le projet Pix, [la décision d'utiliser les modules ECMAScript pour modulariser le code NodeJS](https://github.com/1024pix/pix/blob/dev/docs/adr/0047-modulariser-le-code-nodejs.md) a été prise à la date du 2023-05-05.

L'objectif est de déterminer si une décision similaire doit être prise sur ce projet (Pix Editor), en se basant sur les mêmes critères que ceux décrits dans la décision sur le projet Pix.

Il doit également être pris en compte dans cette décision que le projet Pix Editor vise autant que possible à adopter une architecture proche de celle du projet Pix, afin de permettre aux développeurs de travailler dans un environnement le plus homogène possible.

Comme sur la décision du projet Pix, nous n'examinons ici que les 2 solutions les plus répandues :
 - les modules CommonJS
 - les modules ECMAScript

### Solution n°1 : Modules CommonJS

**Description**

Les modules CommonJs sont la solution historiquement utilisée sur NodeJS. C'est également la solution actuellement utilisée sur l'API Pix Editor, ainsi que les scripts Pix Editor.

**Avantage(s):**

- cette solution est connue des développeurs
- cette solution permet l'import de module **en lazy** sans asynchronicité

**Inconvénient(s):**

- cette solution n'a pas été standardisée (elle est cependant supportée par d'autres environnement que NodeJS)
- cette solution ne s'appuie pas sur une syntaxe (le/les éléments sont affectés à la propriété `module.exports`)
- cette solution ne garantie pas la stabilité des exports (`module.exports` est mutable)
- cette solution ne permet pas au moteur JavaScript de vérifier la validité des imports déclarés dans un module
- cette solution est de moins en moins répandue dans l'écosystème JavaScript
- cette solution n'est pas celle utilisée sur le projet Pix

### Solution n°2 : ECMA script modules

**Description**

Les modules ECMAScript, comme leur nom l'indique, sont la solution standard pour modulariser la code JavaScript. Ils sont également supportés par NodeJS depuis sa version 14.

**Avantage(s):**

- cette solution est connue des développeurs
- cette solution est supportée par tous types d'environnement (navigateurs, serveurs, etc.)
- cette solution est standard et pérenne
- cette solution s'appuie sur une syntaxe d'import / export
- cette solution garantie la stabilité (ou l'immutabilité) des exports
- cette solution permet au moteur JavaScript de vérifier la validité des imports déclarés dans un module
- cette solution est la même que celle utilisée sur le projet Pix

**Inconvénient(s):**

- cette solution nécessite une migration de l'API et des scripts Pix Editor
- cette solution nécessite du code asynchrone pour l'import de module **en lazy**

## Décision

Nous avons choisi la solution n°2, à savoir les modules ECMAScript, afin d'adopter une architecture plus proche de celle du projet Pix.

## Conséquences

Migrer le code de l'API et des scripts Pix Editor des modules CommonJS vers les modules ECMAScript.

Pour cela :

- effectuer une migration manuelle du code de l'API et des scripts

Encadrer l'usage des modules ECMA script avec des règles de lint:

- les imports seront majoritairement nommés
