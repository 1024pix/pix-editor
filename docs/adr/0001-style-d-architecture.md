# 1. Style d'architecture

Date : 2020-03-04

## État

Obsolète

## Contexte

Afin de diminuer l'adhérence entre le référentiel de contenu (appelé learning content repository en anglais) - actuellement modélisé et stocké dans Airtable - et le reste du SI, une API est créée.
A terme aucun autre composant du SI (front ou back) n'accèdera directement à Airtable.

## Décision

Cette API étant dans un premier temps un simple déplacement de la logique des datasources de l'API actuel, on choisit d'implémenter une architecture controller - usecases - datasources.

## Conséquences

Nous n'implémentons pas de repositories dans un premier temps et laissons l'architecture émergée des futurs besoins,
non connus pour le moment.

