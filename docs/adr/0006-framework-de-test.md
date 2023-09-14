# 6. Choix d'un framework de test backend

Date : 2023-09-13

## État

Accepté

## Contexte

Les frameworks de test incluent :
 - un test runner ;
 - une bibliothèque d'assertions ;
 - une bibliothèque de mock.

Sur ce projet, nous avons besoin de tester de manière automatisée le code de l'API et des scripts :
 - de manière expressive : le test dit clairement ce qu'il attend ;
 - simplement : apprendre un nouveau langage d'assertion est coûteux ;
 - avec fiabilité : les nouvelles versions du framework doivent être disponibles régulièrement et installables facilement.

Il existe de nombreux frameworks de tests, dans le cadre de cette décision nous n'examinerons que 3 solutions :
 - Mocha avec Chai pour les assertions et Sinon pour les mocks
 - Jest
 - Vitest

## Solution 1 : Mocha avec Chai pour les assertions et Sinon pour les mocks

Mocha est un test runner, et nécessite l'utilisation de bibliothèques supplémentaires :
 - Chai pour les assertions
 - Sinon pour les mocks

### Avantages

 - Cette solution est déjà en place sur le projet
 - Cette solution utilise une API connue des développeurs

### Inconvénients

 - Cette solution ne permet pas (et ne permettra pas) de mocker les modules ESM
 - Cette solution ne permet pas d'exécuter les tests dans un environnement isolé
 - Cette solution est maintenue moins activement et bénéficie rarement de nouvelles fonctionnalités

## Solution 2 : Jest

Jest est un framework de test complet, permettant également les assertions et les mocks.

### Avantages

 - Cette solution utilise une API connue des développeurs
 - Cette solution permet d'exécuter les tests dans un environnement isolé
 - Cette solution est maintenue activement et apporte souvent de nouvelles fonctionnalités

### Inconvénients

 - Cette solution nécessite une migration des assertions vers l'API de Jest, différente de celle de Sinon
 - Cette solution fournit un support expérimental des modules ESM, nécessitant de la configuration et du code spécifique (voir https://jestjs.io/docs/ecmascript-modules)

## Solution 3 : Vitest

Vitest est un framework de test complet, permettant également les assertions et les mocks.

### Avantages

 - Cette solution utilise une API connue des développeurs
 - Cette solution ne nécesite pas de migration des assertions (Vitest est compatible avec l'API de Chai et de Jest), à l'exception des assertions de type `toHaveBeenCalled`
 - Cette solution permet de mocker les modules ESM
 - Cette solution permet d'avoir du typage avec l'import explicite des fonctions de test
 - Cette solution permet d'exécuter les tests dans un environnement isolé
 - Cette solution est maintenue activement et apporte souvent de nouvelles fonctionnalités

### Inconvénients

 - Cette solution nécessite l'ajout d'imports explicites pour les fonctions de test (`describe`, `it`, `expect`, `beforeEach`, etc.)

## Décision

Nous avons choisi la solution n°3, à savoir Vitest, notamment en raison de son support des modules ESM sans surcoût.

### Conséquences

 - Migrer les tests de l'API et des scripts sur Vitest.
