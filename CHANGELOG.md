

## v3.17.0 (08/01/2021)

- [#69](https://github.com/1024pix/pix-editor/pull/69) [FEATURE] Permettre la création d'acquis de même niveau qu'un acquis existant (PE-43).
- [#74](https://github.com/1024pix/pix-editor/pull/74) [TECH] Rafraîchir le cache de la prévisualisation lors de la modification d'un élément.

## v3.16.0 (07/01/2021)

- [#68](https://github.com/1024pix/pix-editor/pull/68) [FEATURE] Générateur de résultat thématique (PE-39).
- [#71](https://github.com/1024pix/pix-editor/pull/71) [BUGFIX] Ajout des champs manquants dans le contenu du référentiel exposé via `GET /current-content`
- [#70](https://github.com/1024pix/pix-editor/pull/70) [BUGFIX] Ré-activation de l'authentification
- [#67](https://github.com/1024pix/pix-editor/pull/67) [TECH] Ajout d'une route GET /releases/latest permettant la récupération de l'intégralité du référentiel de contenu tel qu'utilisé par Pix API.

## v3.15.0 (18/11/2020)

- [#63](https://github.com/1024pix/pix-editor/pull/63) [FEATURE] Ajouter le calcul des seuils dans le générateur de profils cibles (PE-38).
- [#66](https://github.com/1024pix/pix-editor/pull/66) [FEATURE] Ajouter un bouton pour afficher l'éditeur markdown en pleine écran.
- [#62](https://github.com/1024pix/pix-editor/pull/62) [FEATURE] Ajouter les droits d'edition des epreuves en production pour les éditeurs (PE-42).
- [#61](https://github.com/1024pix/pix-editor/pull/61) [FEATURE] Améliorer le design du pdf de la liste des sujets (PE-18).
- [#55](https://github.com/1024pix/pix-editor/pull/55) [FEATURE]  Afficher les logs des acquis (PE-14).
- [#53](https://github.com/1024pix/pix-editor/pull/53) [FEATURE] Ajouter des logs pour la modification d'un acquis (PE-13)
- [#60](https://github.com/1024pix/pix-editor/pull/60) [TECH] Mise à jour des dépendances de Pix-editor.
- [#59](https://github.com/1024pix/pix-editor/pull/59) [TECH] Mise à jour des dépendances de l'API.

## v3.14.0 (28/10/2020)

- [#58](https://github.com/1024pix/pix-editor/pull/58) [TECH] Ajout d'une route préfixée `v0` pour les appels proxifiés vers Airtable.

## v3.13.0 (26/10/2020)

- [#56](https://github.com/1024pix/pix-editor/pull/56) [FEATURE] Ajout du format "Nombre" pour les challenges QROC
- [#57](https://github.com/1024pix/pix-editor/pull/57) [TECH] Lancer les tests end-to-end sur la CI.
- [#54](https://github.com/1024pix/pix-editor/pull/54) [TECH] Router les requêtes airtable via l'API.
- [#47](https://github.com/1024pix/pix-editor/pull/47)  [FEATURE] Retirer la possibilité d’ignorer les logs  (PE-35)
- [#51](https://github.com/1024pix/pix-editor/pull/51) [CLEANUP] Suppression du code mort relatif aux noms d'auteur.

## v3.12.2 (05/10/2020)

- [#52](https://github.com/1024pix/pix-editor/pull/52) [BUGFIX] Réparation de la mise à jour du cache lors de l'enregistrement d'une épreuve.

## v3.12.1 (01/10/2020)


## v3.12.0 (01/10/2020)

- [#44](https://github.com/1024pix/pix-editor/pull/44) [FEATURE] Ajout d'un bouton de déconnexion.
- [#39](https://github.com/1024pix/pix-editor/pull/39) [FEATURE] Ajout de l'identification d'un utilisateur par une clé d'API (`GET /users/me`).
- [#50](https://github.com/1024pix/pix-editor/pull/50) [BUGFIX] Réparation de la recherche de tutoriels.
- [#48](https://github.com/1024pix/pix-editor/pull/48) [TECH] Merge automatique grâce aux Github Actions
- [#49](https://github.com/1024pix/pix-editor/pull/49) [CLEANUP] Suppression du job de déploiement de pix-editor sur GitHub Pages.

## v3.11.1 (30/09/2020)


## v3.11.0 (30/09/2020)

- [#40](https://github.com/1024pix/pix-editor/pull/40) [FEATURE] Récupération des domaines de compétences depuis l'API LCMS.
- [#45](https://github.com/1024pix/pix-editor/pull/45) [TECH] Utiliser les ID permanent pour les notes (PE-33)
- [#46](https://github.com/1024pix/pix-editor/pull/46) [TECH] Suppression de la couche usecase.
- [#43](https://github.com/1024pix/pix-editor/pull/43) [TECH] Ne pas commenter plusieurs fois la PR avec les URLs des Review Apps.
- [#41](https://github.com/1024pix/pix-editor/pull/41) [TECH] Construire l'application front et la servir depuis l'API.
- [#37](https://github.com/1024pix/pix-editor/pull/37) [TECH] Adaptation du déploiement de Pix-Editor sur GitHub pages pour être déclenché seulement sur un tag.

## v3.10.1 (05/09/2020)


