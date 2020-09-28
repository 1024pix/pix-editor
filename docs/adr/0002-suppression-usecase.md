# 2. Suppression de la couche `usecase`

Date : 2020-09-28

## État

Proposé

## Contexte

L'ADR [0001-style-d-architecture](./0001-style-d-architecture.md) proposait de ne pas implémenter la couche `repository` tout en conservant la couche `usecase`.
À l'usage, après la création de quelques routes, il apparait que la couche `repository` est utile pour implémenter la logique spécifique de l'API alors que la couche `usecase` n'apporte pas de valeur, étant un simple "passe-plat" entre `controller` et `repository`.

## Décision

On choisit de supprimer la couche `usecase`.
Ainsi l'architecture est constituée de `controller` -> `repository` -> `datasource`.

## Conséquences

Le `controller` devient responsable de l'appel du bon `repository` et de l'utilisation du bon `serializer` pour envoyer la réponse à la requête.

