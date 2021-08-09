

## v3.42.0 (09/08/2021)

- [#201](https://github.com/1024pix/pix-editor/pull/201) [FEATURE] Permettre de désigner une épreuve comme "focus" (pix-2877).
- [#205](https://github.com/1024pix/pix-editor/pull/205) [BUGFIX] Utilise la file d'attente pour les appels xmlhttprequest dans l'adaptateur Application
- [#204](https://github.com/1024pix/pix-editor/pull/204) [BUGFIX] Filtrer la vue épreuves et acquis par langue.

## v3.41.1 (04/08/2021)

- [#202](https://github.com/1024pix/pix-editor/pull/202) |BUGFIX] Corrige l'affichage des drapeaux dans la liste des épreuves
- [#203](https://github.com/1024pix/pix-editor/pull/203) [BUGFIX] Serialiser et déserialiser la relation des pièces jointes de airtable dans pix-editor.

## v3.41.0 (03/08/2021)

- [#198](https://github.com/1024pix/pix-editor/pull/198) [FEATURE] Rafraichit le cache de la recette lorsqu'une épreuve est ajoutée ou modifiée
- [#197](https://github.com/1024pix/pix-editor/pull/197) [FEATURE] Crée un script d'import des paramètres delta en alpha
- [#199](https://github.com/1024pix/pix-editor/pull/199) [FEATURE] Vérifie que l'utilisateur a les droits en écriture dans l'API challenges
- [#194](https://github.com/1024pix/pix-editor/pull/194) [BUGFIX] Supprime un caractère non voulu dans le message de nouvelle version
- [#191](https://github.com/1024pix/pix-editor/pull/191) [BUGFIX] N'essaye pas d'ouvrir airtable ou la preview toujours dans la même fenêtre
- [#196](https://github.com/1024pix/pix-editor/pull/196) [TECH] Ajouter les colonnes `Difficulté calculée` et `Discrimination calculée` au référentiel
- [#195](https://github.com/1024pix/pix-editor/pull/195) [TECH] Utilise une base de données spécifique pour redis en mode test
- [#185](https://github.com/1024pix/pix-editor/pull/185) [TECH] Utilise le format JSON:API pour la communication entre pix editor et l'api LCMS pour la manipulation des Epreuves.
- [#193](https://github.com/1024pix/pix-editor/pull/193) [TECH] Mise à jour des dépendances "vulnérable"
- [#192](https://github.com/1024pix/pix-editor/pull/192) [TECH] Nettoyage d'attribut et de l'utilisation de nock.cleanAll
- [#200](https://github.com/1024pix/pix-editor/pull/200) [PIX-2816] Ajout de la validation des paramêtres avec JOI

## v3.40.0 (29/06/2021)

- [#186](https://github.com/1024pix/pix-editor/pull/186) [FEATURE] Ajouter les thématiques à l'export des sujet (PE-64)
- [#179](https://github.com/1024pix/pix-editor/pull/179) [FEATURE] Permettre la création de nouveaux référentiels Pix + (PE-70).
- [#184](https://github.com/1024pix/pix-editor/pull/184) [BUGFIX] Corrige la sortie de comparaison de releases
- [#188](https://github.com/1024pix/pix-editor/pull/188) [TECH] Utilise la table `attachments` dans les formulaires de Pix Editor.
- [#189](https://github.com/1024pix/pix-editor/pull/189) [TECH] Vérification des droits sur les routes API.
- [#190](https://github.com/1024pix/pix-editor/pull/190) [TECH] Ajout du linter eslint-plugin-qunit
- [#183](https://github.com/1024pix/pix-editor/pull/183) [TECH] Améliorer le nommage des thematique/sujet/acquis des ateliers (PE-78)
- [#180](https://github.com/1024pix/pix-editor/pull/180) [TECH] Migre les fichiers attachés dans un sous dossier pour préserver leur nom original
- [#187](https://github.com/1024pix/pix-editor/pull/187) Ajout d'un fichier de licence

## v3.39.0 (15/06/2021)

- [#182](https://github.com/1024pix/pix-editor/pull/182) [BUGFIX] Encode le nom du fichier dans l'URL lors de l'upload
- [#181](https://github.com/1024pix/pix-editor/pull/181) [TECH] Gère les erreurs lors du calcul de la somme de controle des fichiers distant

## v3.38.0 (09/06/2021)

- [#178](https://github.com/1024pix/pix-editor/pull/178) [FEATURE] Limite les valeurs possible dans admin-bro pour la propriété access des Users
- [#176](https://github.com/1024pix/pix-editor/pull/176) [FEATURE] Garder le nom d'une image lors de son téléchargement
- [#170](https://github.com/1024pix/pix-editor/pull/170) [FEATURE] Permettre la création de nouveaux domaines (PE-69).
- [#177](https://github.com/1024pix/pix-editor/pull/177) [BUGFIX] Ne pas crasher l'application quand on affiche les releases sur l'admin.
- [#175](https://github.com/1024pix/pix-editor/pull/175) [TECH] Nettoyage des différents builder (PIX-2686)

## v3.37.2 (07/06/2021)

- [#174](https://github.com/1024pix/pix-editor/pull/174) [BUGFIX] Répare la page statistiques.

## v3.37.1 (07/06/2021)

- [#173](https://github.com/1024pix/pix-editor/pull/173) [BUGFIX] Corrige le nom du champ Généalogie

## v3.37.0 (07/06/2021)

- [#168](https://github.com/1024pix/pix-editor/pull/168) [FEATURE] Ajout de admin-bro
- [#166](https://github.com/1024pix/pix-editor/pull/166) [FEATURE] Récupérer la colonne Airtable 'Focalisée' de la table Epreuves (PIX-2616).
- [#171](https://github.com/1024pix/pix-editor/pull/171) [BUGFIX] Corrige le type du champ Origin2
- [#172](https://github.com/1024pix/pix-editor/pull/172) [TECH] Ajout de tout les champs des challenges utilisé dans Pix-editor dans le datasource de l'API
- [#167](https://github.com/1024pix/pix-editor/pull/167) [TECH] Utilise les id persistant des challenges comme id dans pix-editor
- [#165](https://github.com/1024pix/pix-editor/pull/165) [TECH] Supprime l'existence des tests
- [#156](https://github.com/1024pix/pix-editor/pull/156) [TECH] Utiliser une nouvelle table référentiel à la place de la colonne source d'une compétence (PE-75).
- [#169](https://github.com/1024pix/pix-editor/pull/169) [CLEAN] Supprime le champ non utilisé skills des objets challenge de la release.

## v3.36.0 (19/05/2021)

- [#162](https://github.com/1024pix/pix-editor/pull/162) [BUGFIX] Corrige l'affichage des drapeaux dans la liste des épreuves archivés
- [#161](https://github.com/1024pix/pix-editor/pull/161) [BUGFIX] Empêcher le rechargement d'une page lorsque l'on appuye sur entrer dans un formulaire.
- [#160](https://github.com/1024pix/pix-editor/pull/160) [BUGFIX] Correction de l'affichage des drapeaux dans la liste des alternatives
- [#163](https://github.com/1024pix/pix-editor/pull/163) [TECH] Évite de remplir redis lors de la création de release
- [#164](https://github.com/1024pix/pix-editor/pull/164) [TECH] Refactoring des `model` des routes en utilisant async/await

## v3.35.0 (17/05/2021)

- [#159](https://github.com/1024pix/pix-editor/pull/159) [TECH] Ajout du type d'erreur lors d'une erreur de queue
- [#158](https://github.com/1024pix/pix-editor/pull/158) [TECH] Rend cohérent les noms des propriétés d'un challenge entre ceux de la release et ceux de `pix-editor`.
- [#157](https://github.com/1024pix/pix-editor/pull/157) [TECH] Mise à jour des dépendances
- [#155](https://github.com/1024pix/pix-editor/pull/155) [TECH] Refacto de la serialization de mirage.
- [#150](https://github.com/1024pix/pix-editor/pull/150) [TECH] Ajoute le service Redis dans le job end-to-end de la CI.

## v3.34.0 (10/05/2021)

- [#149](https://github.com/1024pix/pix-editor/pull/149) [FEATURE] Ajout d'information sur le champs des propositions de réponses des QROC.
- [#147](https://github.com/1024pix/pix-editor/pull/147) [FEATURE] Envoi des retours a la ligne en continu lors de la création de la release
- [#148](https://github.com/1024pix/pix-editor/pull/148) [TECH] Mise à jour de bull et de ioredis

## v3.33.0 (03/05/2021)

- [#142](https://github.com/1024pix/pix-editor/pull/142) [FEATURE] Ajouter la gestion des compétences (PE-2).
- [#146](https://github.com/1024pix/pix-editor/pull/146) [BUGFIX] Ré-essaie de s‘authentifier sur l‘API Pix si le jeton est expiré.

## v3.32.0 (20/04/2021)

- [#145](https://github.com/1024pix/pix-editor/pull/145) [TECH] Ajout de logs sur la queue de release
- [#144](https://github.com/1024pix/pix-editor/pull/144) [TECH] Utiliser le proxy airTable pour récupérer les domaines.
- [#143](https://github.com/1024pix/pix-editor/pull/143) [TECH] refactorisation la gestion du loading lors de la validation d'une épreuve.

## v3.31.0 (13/04/2021)

- [#141](https://github.com/1024pix/pix-editor/pull/141) [TECH] Utilisation de la file de jobs pour la création de release via l'API.

## v3.30.0 (08/04/2021)

- [#131](https://github.com/1024pix/pix-editor/pull/131) [FEATURE] Utilise la table attachments et dl.pix.fr lors de la release (Pix-2386)
- [#130](https://github.com/1024pix/pix-editor/pull/130) [FEATURE] Réorganisation des bouttons de gestion des sujets (PE-68).
- [#140](https://github.com/1024pix/pix-editor/pull/140) [BUGFIX] Corrige la suppression d'une pièce jointe post création d'une déclinaison d'une épreuve.
- [#139](https://github.com/1024pix/pix-editor/pull/139) [BUGFIX] Améliorer la gestion du loading lors de la validation d'une épreuve (PE-72)

## v3.29.0 (07/04/2021)

- [#138](https://github.com/1024pix/pix-editor/pull/138) [FEATURE] Ajout de routes API pour créer et récupérer une release.
- [#137](https://github.com/1024pix/pix-editor/pull/137) [FEATURE] Utiliser l'editeur markdown pour éditer les proposition d'une épreuve (PE-71).
- [#136](https://github.com/1024pix/pix-editor/pull/136) [BUGFIX] Renomme l'entête des attachements sur le seau de stockage.
- [#135](https://github.com/1024pix/pix-editor/pull/135) [BUGFIX] Corrige la suppression du texte alternatif d'une illustration.
- [#132](https://github.com/1024pix/pix-editor/pull/132) [TECH] Supprime le code de l'extension firefox

## v3.28.0 (01/04/2021)

- [#126](https://github.com/1024pix/pix-editor/pull/126) [FEATURE] Ajouter le champ `Bonne réponse à afficher` (PE-67).
- [#134](https://github.com/1024pix/pix-editor/pull/134) [BUGFIX] Corrige l'erreur lors de la fermeture d'un nouveau acquis
- [#133](https://github.com/1024pix/pix-editor/pull/133) [BUGFIX] Corrige la suppression et l'upload d'une illustration dans une épreuve
- [#127](https://github.com/1024pix/pix-editor/pull/127) [TECH] Intégre la gestion des tokens d'upload dans l'API LCMS (PIX 2092)

## v3.27.0 (24/03/2021)

- [#129](https://github.com/1024pix/pix-editor/pull/129) [TECH] Nous y avons cru, mais le revert est nécessaire (was: no more airtable attachments)

## v3.26.0 (24/03/2021)

- [#125](https://github.com/1024pix/pix-editor/pull/125) [FEATURE] Utilise la table attachments dans la release ce qui permet d'avoir des URLs en dl.pix.fr :rocket: (PIX-2386)
- [#113](https://github.com/1024pix/pix-editor/pull/113) [FEATURE] Permettre le tri des thématiques et des sujets (PE-62).
- [#124](https://github.com/1024pix/pix-editor/pull/124) [TECH] Ne pas notifier PIX-API lors de la création d'une release.

## v3.25.0 (16/03/2021)

- [#112](https://github.com/1024pix/pix-editor/pull/112) [FEATURE] Permettre la gestion des thématiques (PE-17)
- [#123](https://github.com/1024pix/pix-editor/pull/123) [FEATURE] Ajouter le portugais comme option de langue pour une épreuve (PE-66).
- [#121](https://github.com/1024pix/pix-editor/pull/121) [FEATURE] Récupérer la nouvelle colone 'Bonnes réponses à afficher' de la table Epreuves (PIX-2265).
- [#118](https://github.com/1024pix/pix-editor/pull/118) [FEATURE] Ajouter un champ de consigne alternative pour les épreuves (PE-32).
- [#120](https://github.com/1024pix/pix-editor/pull/120) Fait la vérification des pièces jointes en parallèle

## v3.24.0 (08/03/2021)

- [#116](https://github.com/1024pix/pix-editor/pull/116) [FEATURE] Modification de migration des pieces jointes en pointant vers le bucket OVH
- [#109](https://github.com/1024pix/pix-editor/pull/109) [FEATURE] Ajouter les en-têtes HTTP sur les fichiers joints aux épreuves (PIX-2174).
- [#111](https://github.com/1024pix/pix-editor/pull/111) [FEATURE] Ajout de la notion de version du référentiel (PIX-2161).
- [#110](https://github.com/1024pix/pix-editor/pull/110) [FEATURE] Ajouter les thématique dans le référentiel (PE-16)
- [#107](https://github.com/1024pix/pix-editor/pull/107) [FEATURE] Afficher le nom du sujet et leur titre pratique dans le générateur de profil cible (PE-59).
- [#119](https://github.com/1024pix/pix-editor/pull/119) [BUGFIX] Ne pas ajouter le header `Content-Disposition` pour les illustrations.
- [#117](https://github.com/1024pix/pix-editor/pull/117) [TECH] Rajouter des headers aux pièces jointes PIX-2308.
- [#114](https://github.com/1024pix/pix-editor/pull/114) [TECH] Création d'un outillage de vérification post-migration des pièces jointes (PIX-2163).
- [#115](https://github.com/1024pix/pix-editor/pull/115) [TECH] Rendre optionnelles la création de release périodique et la notification associée (PIX-2281).
- [#108](https://github.com/1024pix/pix-editor/pull/108) [TECH] Conserver les url `dl.airtable.com` lors de la migration des `attachments` (PIX-2173).

## v3.23.0 (16/02/2021)

- [#104](https://github.com/1024pix/pix-editor/pull/104) [FEATURE] Filtrer la vue production des sections acquis et épreuves par langue (PE-57) 
- [#106](https://github.com/1024pix/pix-editor/pull/106) [BUGFIX] Corriger la duplication des `attachments`.
- [#103](https://github.com/1024pix/pix-editor/pull/103) [BUGFIX] Duplique les attachments à la duplication d'une épreuve (PIX-2122).
- [#105](https://github.com/1024pix/pix-editor/pull/105) [TECH] Traiter les dépréciations Ember (PIX-2162).

## v3.22.0 (11/02/2021)

- [#102](https://github.com/1024pix/pix-editor/pull/102) [BUGFIX] Corrige la recherche d'une épreuve par son texte
- [#99](https://github.com/1024pix/pix-editor/pull/99) [BUGFIX] Corriger la sauvegarde d'un challenge.
- [#100](https://github.com/1024pix/pix-editor/pull/100) [TECH] Ajout de Sentry sur l'api et pix-editor.
- [#97](https://github.com/1024pix/pix-editor/pull/97) [TECH] Création d'un script de migration des pièces jointes depuis Airtable (PIX-2091).

## v3.21.0 (05/02/2021)

- [#91](https://github.com/1024pix/pix-editor/pull/91) [FEATURE] Gestion des versions d'acquis (PE-56).
- [#84](https://github.com/1024pix/pix-editor/pull/84) [FEATURE] Réorganiser les vues ateliers des acquis et des épreuves (PE-55).
- [#98](https://github.com/1024pix/pix-editor/pull/98) [BUGFIX] Correction de la recherche d'épreuves.

## v3.20.0 (04/02/2021)


## v3.19.1 (04/02/2021)

- [#96](https://github.com/1024pix/pix-editor/pull/96) [BUGFIX] Correction de l'affichage d'un sujet.

## v3.19.0 (03/02/2021)

- [#94](https://github.com/1024pix/pix-editor/pull/94) [FEATURE] Ajout du texte alternatif des illustrations dans la table `Attachments` (PIX-2090).
- [#87](https://github.com/1024pix/pix-editor/pull/87) [BUGFIX] Sauvegarder les fichiers joints dans la table `Attachments` lors de la création d'une épreuve.
- [#92](https://github.com/1024pix/pix-editor/pull/92) [BUGFIX] Attend que les fichiers de l'épreuve soient chargés
- [#86](https://github.com/1024pix/pix-editor/pull/86) [BUGFIX] Correction des tests des composants utilisant Ember-Table.
- [#85](https://github.com/1024pix/pix-editor/pull/85) [BUGFIX] Ouverture du challenge par l'extension Pix-editor.
- [#95](https://github.com/1024pix/pix-editor/pull/95) [TECH] Release de la version 2.4 de l'extension + ajout des scripts de builds
- [#88](https://github.com/1024pix/pix-editor/pull/88) [TECH] Suppression du warning lié à browserslist lors du build de `pix-editor`.
- [#93](https://github.com/1024pix/pix-editor/pull/93) [TECH] Désactive le bouton pour ouvrir pix-editor si aucune compétence détecté dans l'URL
- [#89](https://github.com/1024pix/pix-editor/pull/89) [TECH] Ne pas supprimer la clé de connexion durant les tests.
- [#90](https://github.com/1024pix/pix-editor/pull/90) [TECH] Monter les dépendences des tests end-to-end.
- [#83](https://github.com/1024pix/pix-editor/pull/83) [TECH] Mise a jour d'Ember ainsi que les dépendances Pix-Editor.
- [#79](https://github.com/1024pix/pix-editor/pull/79) [TECH] Ajout d'une table `Attachments` pour gérer les pièces jointes des épreuves.

## v3.18.0 (26/01/2021)

- [#76](https://github.com/1024pix/pix-editor/pull/76) [FEATURE] Gestion de la duplication d'un acquis(PE-45). 
- [#75](https://github.com/1024pix/pix-editor/pull/75) [FEATURE] Gestion des version d'un acquis lors de la validation d'un prototype (PE-46).
- [#73](https://github.com/1024pix/pix-editor/pull/73) [FEATURE] Permettre le choix de la version d'un acquis lors du déplacement d'une épreuve (PE-54)
- [#72](https://github.com/1024pix/pix-editor/pull/72) [FEATURE] Permettre la création d'un prototype lié à la version d'acquis séléctionné (PE-44)
- [#77](https://github.com/1024pix/pix-editor/pull/77) [FEATURE] Ingorer la casse de l'expression recherchée lors de la recherche d'un acquis.
- [#81](https://github.com/1024pix/pix-editor/pull/81) [TECH] Archiver la version active d'un acquis.
- [#82](https://github.com/1024pix/pix-editor/pull/82) [TECH] Mise à jour des dépendances de l'API.
- [#80](https://github.com/1024pix/pix-editor/pull/80) [TECH] Montée de version de node (v14.15.4).
- [#78](https://github.com/1024pix/pix-editor/pull/78) Ajouter une mention prévenant du caractère confidentiel du référentiel

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


