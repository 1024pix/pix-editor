# 3. Création de releases quotidiennes

Date : 2021-02-19

## État

Proposé

## Contexte

Actuellement, il n'existe pas de notion de `release` du référentiel de contenu.
Chaque rafraichissement du cache fait par PIX-API met en production un nouveau référentiel.
De plus il n'est pas possible de connaitre le contenu exact du référentiel tel que les utilisateurs l'ont expérimenté à une date donnée.


## Décision

On crée le concept de `release` du référentiel de contenu.
Une release est constituée du contenu (tel que fourni par la route actuelle `/api/current-content`), un `id` et la date de création de la release.

Afin de garder le fonctionnement actuel, une release est créée toutes les nuits.
On utilise la bibliothèque `bull` qui permet de créer un job périodique.
Voir la réflexion qui avait été menée sur `Pix-API`: [https://1024pix.atlassian.net/wiki/spaces/DEV/pages/1397489665/2020-04-27+tude+de+l+exploitation+de+Redis+d+autres+fins+que+le+stockage+du+Learning+Content#Une-derni%C3%A8re-chose%E2%80%A6](https://1024pix.atlassian.net/wiki/spaces/DEV/pages/1397489665/2020-04-27+tude+de+l+exploitation+de+Redis+d+autres+fins+que+le+stockage+du+Learning+Content#Une-derni%C3%A8re-chose%E2%80%A6).

A chaque création de release, un endpoint de `Pix-API` est appelé pour notifier qu'une nouvelle release a été créée.

## Conséquences

On peut modifier `Pix-API` pour ne plus faire le rafraichissement périodique et ainsi supprimer le container `background` dédié.
