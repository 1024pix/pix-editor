

## v3.95.1 (15/09/2023)


### :bug: Correction
- [#293](https://github.com/1024pix/pix-editor/pull/293) [BUGFIX] Corriger les jobs planifiés avec le passage à ESM.

## v3.95.0 (14/09/2023)


### :building_construction: Tech
- [#278](https://github.com/1024pix/pix-editor/pull/278) [TECH] Migration API PixEditor en ESM (PIX-9135).

### :arrow_up: Montée de version
- [#289](https://github.com/1024pix/pix-editor/pull/289) [BUMP] Update dependency @adminjs/hapi to v7 (api).
- [#283](https://github.com/1024pix/pix-editor/pull/283) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.8.0 (pix-editor).
- [#284](https://github.com/1024pix/pix-editor/pull/284) [BUMP] Update browser-tools orb to v1.4.5 (.circleci).
- [#279](https://github.com/1024pix/pix-editor/pull/279) [BUMP] Update dependency p-queue to v7.4.1 (pix-editor).
- [#281](https://github.com/1024pix/pix-editor/pull/281) [BUMP] Update dependency stylelint-config-standard-scss to v11 (pix-editor).
- [#280](https://github.com/1024pix/pix-editor/pull/280) [BUMP] Update dependency ember-truth-helpers to v4 (pix-editor).

### :coffee: Autre
- [#287](https://github.com/1024pix/pix-editor/pull/287) [DOC] ADR "Choix d'un framework de test backend" (PIX-9155).
- [#285](https://github.com/1024pix/pix-editor/pull/285) [DOC] ADR "Modulariser le code NodeJS" (PIX-9154).

## v3.94.0 (08/09/2023)


### :rocket: Amélioration
- [#271](https://github.com/1024pix/pix-editor/pull/271) [FEATURE] Supprimer l'usage des traductions de compétence de Airtable (PIX-9013).

### :building_construction: Tech
- [#277](https://github.com/1024pix/pix-editor/pull/277) [TECH] Refactorisation des builders et modèles domaines de l'API (PIX-9124).
- [#122](https://github.com/1024pix/pix-editor/pull/122) [TECH] Clarifier la procédure d'installation.
- [#275](https://github.com/1024pix/pix-editor/pull/275) [TECH] Supprimer la colonne "imageUrl" de la table des tests statiques, attribut non utilisé (PIX-9080).
- [#200](https://github.com/1024pix/pix-editor/pull/200) [TECH] Remplacer Cypress par Playwright (PIX-9025).

### :bug: Correction
- [#274](https://github.com/1024pix/pix-editor/pull/274) [BUGFIX] Logs d'erreur à tort lors de l'enregistrement de traductions (PIX-9077).

### :arrow_up: Montée de version
- [#276](https://github.com/1024pix/pix-editor/pull/276) [BUMP] Update dependency p-queue to v7.4.0 (pix-editor).
- [#273](https://github.com/1024pix/pix-editor/pull/273) [BUMP] Update redis Docker tag to v7.
- [#270](https://github.com/1024pix/pix-editor/pull/270) [BUMP] Lock file maintenance (dossier racine).
- [#268](https://github.com/1024pix/pix-editor/pull/268) [BUMP] Update browser-tools orb to v1.4.4 (.circleci).
- [#272](https://github.com/1024pix/pix-editor/pull/272) [BUMP] Update dependency eslint to v8.48.0.
- [#269](https://github.com/1024pix/pix-editor/pull/269) [BUMP] Lock file maintenance (api).

## v3.93.0 (04/09/2023)


### :rocket: Amélioration
- [#265](https://github.com/1024pix/pix-editor/pull/265) [FEATURE] Adapter les seeds pour insérer les traductions dans la base PG (PIX-8986).
- [#263](https://github.com/1024pix/pix-editor/pull/263) [FEATURE] Renseigner les traductions de Compétences pour la réplication via la table PG `translations`(PIX-8973).
- [#260](https://github.com/1024pix/pix-editor/pull/260) [FEATURE] Adapter la release pour insérer les translations de PG (PIX-8706).
- [#257](https://github.com/1024pix/pix-editor/pull/257) [FEATURE] Permettre d'afficher dans PixEditor les traductions d'une compétence (PIX-8686).

### :building_construction: Tech
- [#254](https://github.com/1024pix/pix-editor/pull/254) [TECH] Utiliser eslint-plugin-n plutôt que eslint-plugin-node.

### :bug: Correction
- [#267](https://github.com/1024pix/pix-editor/pull/267) [BUGFIX] Erreur quand on vérifie la table translation (Airtable) avec un PAT (PIX-9033).
- [#266](https://github.com/1024pix/pix-editor/pull/266) [BUGFIX] Problème d'enregistrement de compétence incomplète lorsque la description n'est pas renseignée (PIX-9026).
- [#261](https://github.com/1024pix/pix-editor/pull/261) [BUGFIX] Ne pas appeler `process.exit` dans les tests (PIX-9015).
- [#259](https://github.com/1024pix/pix-editor/pull/259) [BUGFIX] Changer le suffixe des traductions des compétences.

### :arrow_up: Montée de version
- [#264](https://github.com/1024pix/pix-editor/pull/264) [BUMP] Update dependency ember-simple-auth to v6 (pix-editor).
- [#258](https://github.com/1024pix/pix-editor/pull/258) [BUMP] Update dependency googleapis to v126 (api).
- [#262](https://github.com/1024pix/pix-editor/pull/262) [BUMP] Update dependency ember-cli-babel to v8 (pix-editor).

## v3.92.0 (25/08/2023)


### :rocket: Amélioration
- [#255](https://github.com/1024pix/pix-editor/pull/255) [FEATURE] Récupérer et sauvegarder les traductions des compétences depuis airtable (PIX-8705).

### :arrow_up: Montée de version
- [#256](https://github.com/1024pix/pix-editor/pull/256) [BUMP] Lock file maintenance (pix-editor).

## v3.91.0 (23/08/2023)


### :rocket: Amélioration
- [#246](https://github.com/1024pix/pix-editor/pull/246) [FEATURE] Stocker les traductions d'une nouvelle compétence (PIX-8687).

### :arrow_up: Montée de version
- [#252](https://github.com/1024pix/pix-editor/pull/252) [BUMP] Lock file maintenance (api).
- [#250](https://github.com/1024pix/pix-editor/pull/250) [BUMP] Update dependency googleapis to v125 (api).
- [#251](https://github.com/1024pix/pix-editor/pull/251) [BUMP] Update dependency url-regex-safe to v4 (api).
- [#248](https://github.com/1024pix/pix-editor/pull/248) [BUMP] Update dependency googleapis to v124 (api).
- [#244](https://github.com/1024pix/pix-editor/pull/244) [BUMP] Update dependency node to v18.17.1.
- [#245](https://github.com/1024pix/pix-editor/pull/245) [BUMP] Update dependency eslint to v8.47.0.

## v3.90.0 (22/08/2023)


### :rocket: Amélioration
- [#243](https://github.com/1024pix/pix-editor/pull/243) [FEATURE] Faire que le lien vers le test statique soit dirigé vers l'environnement de production (PIX-8949).
- [#235](https://github.com/1024pix/pix-editor/pull/235) [FEATURE] N'afficher que les tests statiques actifs par défaut et permettre à l'utilisateur de pouvoir tous les afficher (PIX-8648).
- [#234](https://github.com/1024pix/pix-editor/pull/234) [FEATURE] Pouvoir renseigner un commentaire lors de la désactivation d'un test statique et écrire ce commentaire à côté du statut (PIX-8647).
- [#233](https://github.com/1024pix/pix-editor/pull/233) [FEATURE] Ajouter un lien de prévisualisation de l'épreuve dans la liste des épreuves sur la page de détails d'un test statique (PIX-8515).

### :building_construction: Tech
- [#240](https://github.com/1024pix/pix-editor/pull/240) [TECH] Récupérer la déclinaison du challenge (PIX-7702).

## v3.89.0 (11/08/2023)


### :rocket: Amélioration
- [#232](https://github.com/1024pix/pix-editor/pull/232) [FEATURE] Ajouter l'information de statut d'un test statique dans la release afin que cette information puisse être exploitée côté Pix (PIX-8900).

### :arrow_up: Montée de version
- [#236](https://github.com/1024pix/pix-editor/pull/236) [BUMP] Update dependency eslint to v8.46.0.
- [#237](https://github.com/1024pix/pix-editor/pull/237) [BUMP] Update dependency @1024pix/pix-ui to v39 (pix-editor).
- [#223](https://github.com/1024pix/pix-editor/pull/223) [BUMP] Update dependency ember-sortable to v5 (pix-editor).
- [#225](https://github.com/1024pix/pix-editor/pull/225) [BUMP] Update dependency eslint-plugin-qunit to v8 (pix-editor).

## v3.88.0 (10/08/2023)


### :rocket: Amélioration
- [#228](https://github.com/1024pix/pix-editor/pull/228) [FEATURE] Pouvoir désactiver un test statique (PIX-7798).

### :bug: Correction
- [#231](https://github.com/1024pix/pix-editor/pull/231) [BUGFIX]  Inverser l'ordre des challenges des tests statiques(PIX-8898).

## v3.87.0 (08/08/2023)


### :rocket: Amélioration
- [#227](https://github.com/1024pix/pix-editor/pull/227) [FEATURE] Afficher le statut du test statique sur la liste des tests statiques et sur la page de détails d'un test statique (PIX-8643).
- [#226](https://github.com/1024pix/pix-editor/pull/226) [FEATURE] Faire en sorte qu'un test statique nouvellement créé soit actif par défaut (PIX-8567).
- [#170](https://github.com/1024pix/pix-editor/pull/170) [FEATURE] Migrer les tests statiques de Airtable vers Postgres (PIX-7793).

### :building_construction: Tech
- [#172](https://github.com/1024pix/pix-editor/pull/172) [TECH] Correction du champ license des package.json.
- [#215](https://github.com/1024pix/pix-editor/pull/215) [TECH] Ajout d'un script pour peupler les champs alpha et delta des challenges à partir d'un CSV.
- [#206](https://github.com/1024pix/pix-editor/pull/206) [TECH] Spécifie les version de ember-source et d'ember-data qui fonctionnent.
- [#167](https://github.com/1024pix/pix-editor/pull/167) [TECH] :green_heart: Déclarer les environnements CircleCI dans des executors.
- [#155](https://github.com/1024pix/pix-editor/pull/155) [TECH] Upgrade embroider en v3.

### :arrow_up: Montée de version
- [#230](https://github.com/1024pix/pix-editor/pull/230) [BUMP] Update dependency @fortawesome/ember-fontawesome to v1 (pix-editor).
- [#229](https://github.com/1024pix/pix-editor/pull/229) [BUMP] Update redis to v7 (major).
- [#222](https://github.com/1024pix/pix-editor/pull/222) [BUMP] Update dependency ember-resolver to v11 (pix-editor).
- [#208](https://github.com/1024pix/pix-editor/pull/208) [BUMP] Update dependency ember-source to ~4.12.0 (pix-editor).
- [#219](https://github.com/1024pix/pix-editor/pull/219) [BUMP] Update dependency cypress to v9 (end-to-end-tests).
- [#220](https://github.com/1024pix/pix-editor/pull/220) [BUMP] Update dependency ember-cli to v5 (pix-editor).
- [#197](https://github.com/1024pix/pix-editor/pull/197) [BUMP] Update dependency @1024pix/stylelint-config to v4 (pix-editor).
- [#218](https://github.com/1024pix/pix-editor/pull/218) [BUMP] Update dependency cypress to v8 (end-to-end-tests).
- [#216](https://github.com/1024pix/pix-editor/pull/216) [BUMP] Update dependency node to v18.
- [#211](https://github.com/1024pix/pix-editor/pull/211) [BUMP] Update dependency cypress to v7 (end-to-end-tests).
- [#214](https://github.com/1024pix/pix-editor/pull/214) [BUMP] Update dependency ember-resolver to v10 (pix-editor).
- [#213](https://github.com/1024pix/pix-editor/pull/213) [BUMP] Update dependency ember-aria-tabs to v7 (pix-editor).
- [#212](https://github.com/1024pix/pix-editor/pull/212) [BUMP] Update dependency ember-a11y-accordion to v3 (pix-editor).
- [#209](https://github.com/1024pix/pix-editor/pull/209) [BUMP] Lock file maintenance (pix-editor).
- [#205](https://github.com/1024pix/pix-editor/pull/205) [BUMP] Update dependency ember-resolver to v9 (pix-editor).
- [#204](https://github.com/1024pix/pix-editor/pull/204) [BUMP] Update dependency eslint-plugin-qunit to v7 (pix-editor).
- [#203](https://github.com/1024pix/pix-editor/pull/203) [BUMP] Update dependency ember-qunit to v6 (pix-editor).
- [#199](https://github.com/1024pix/pix-editor/pull/199) [BUMP] Update dependency p-map to v6 (api).
- [#196](https://github.com/1024pix/pix-editor/pull/196) [BUMP] Update dependency url-regex-safe to v3 (api).
- [#191](https://github.com/1024pix/pix-editor/pull/191) [BUMP] Update dependency axios-cookiejar-support to v4 (api).
- [#190](https://github.com/1024pix/pix-editor/pull/190) [BUMP] Update dependency stylelint to v15 (pix-editor).
- [#189](https://github.com/1024pix/pix-editor/pull/189) [BUMP] Update dependency axios to v1 (scripts).
- [#188](https://github.com/1024pix/pix-editor/pull/188) [BUMP] Update dependency axios to v1 (api).
- [#187](https://github.com/1024pix/pix-editor/pull/187) [BUMP] Update dependency faker to v6 (api).
- [#183](https://github.com/1024pix/pix-editor/pull/183) [BUMP] Update dependency eslint-plugin-mocha to v10 (scripts).
- [#182](https://github.com/1024pix/pix-editor/pull/182) [BUMP] Update dependency eslint-plugin-mocha to v10 (api).
- [#181](https://github.com/1024pix/pix-editor/pull/181) [BUMP] Update dependency mocha to v10 (scripts).
- [#180](https://github.com/1024pix/pix-editor/pull/180) [BUMP] Update dependency mocha to v10 (api).
- [#177](https://github.com/1024pix/pix-editor/pull/177) [BUMP] Update dependency @1024pix/pix-ui to v38 (pix-editor).
- [#176](https://github.com/1024pix/pix-editor/pull/176) [BUMP] Update dependency pino to v8 (api).
- [#160](https://github.com/1024pix/pix-editor/pull/160) [BUMP] Update dependency sinon to v15 (scripts).
- [#161](https://github.com/1024pix/pix-editor/pull/161) [BUMP] Update dependency eslint to v8.
- [#142](https://github.com/1024pix/pix-editor/pull/142) [BUMP] Update dependency airtable to v0.12.1 (scripts).
- [#163](https://github.com/1024pix/pix-editor/pull/163) [BUMP] Update dependency googleapis to v123 (api).
- [#140](https://github.com/1024pix/pix-editor/pull/140) [BUMP] Update dependency airtable to ^0.12.0 (api).
- [#169](https://github.com/1024pix/pix-editor/pull/169) [BUMP] Update dependency node to v16.20.1.
- [#168](https://github.com/1024pix/pix-editor/pull/168) [BUMP] Lock file maintenance (dossier racine).
- [#166](https://github.com/1024pix/pix-editor/pull/166) [BUMP] Update dependency p-queue to v7 (pix-editor).
- [#164](https://github.com/1024pix/pix-editor/pull/164) [BUMP] Update dependency ember-cli-showdown to v7 (pix-editor).
- [#162](https://github.com/1024pix/pix-editor/pull/162) [BUMP] Update dependency ember-cli-app-version to v6 (pix-editor).
- [#159](https://github.com/1024pix/pix-editor/pull/159) [BUMP] Update dependency sinon to v15 (api).
- [#158](https://github.com/1024pix/pix-editor/pull/158) [BUMP] Update browser-tools orb to v1.4.3 (.circleci).
- [#157](https://github.com/1024pix/pix-editor/pull/157) [BUMP] Update dependency dotenv to v16 (api).
- [#152](https://github.com/1024pix/pix-editor/pull/152) [BUMP] Update dependency mocha to v8.4.0 (scripts).
- [#156](https://github.com/1024pix/pix-editor/pull/156) [BUMP] Update dependency showdown to v2 (api).

## v3.86.1 (26/07/2023)


### :building_construction: Tech
- [#132](https://github.com/1024pix/pix-editor/pull/132) [TECH] Prévenir le commit de secrets (PIX-8664).

### :bug: Correction
- [#154](https://github.com/1024pix/pix-editor/pull/154) [BUGFIX] Réordonner l'affichage des compétences (PIX-8760).

### :coffee: Autre
- [#150](https://github.com/1024pix/pix-editor/pull/150) [BUMP] Update dependency eslint to v7.32.0.
- [#151](https://github.com/1024pix/pix-editor/pull/151) [BUMP] Update dependency nodemon to v3 (api).
- [#148](https://github.com/1024pix/pix-editor/pull/148) [BUMP] Update dependency cypress to v6.9.1 (end-to-end-tests).
- [#147](https://github.com/1024pix/pix-editor/pull/147) [BUMP] Update dependency chai to v4.3.7 (scripts).
- [#144](https://github.com/1024pix/pix-editor/pull/144) [BUMP] Update dependency axios to ^0.27.0 (scripts).
- [#145](https://github.com/1024pix/pix-editor/pull/145) [BUMP] Lock file maintenance (api).
- [#146](https://github.com/1024pix/pix-editor/pull/146) [BUMP] Update browser-tools orb to v1.4.2 (.circleci).
- [#139](https://github.com/1024pix/pix-editor/pull/139) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.7.0 (pix-editor).
- [#143](https://github.com/1024pix/pix-editor/pull/143) [BUMP] Update dependency axios to ^0.27.0 (api).

## v3.86.0 (25/07/2023)


### :rocket: Amélioration
- [#127](https://github.com/1024pix/pix-editor/pull/127) [FEATURE] Pouvoir modifier un test statique existant (PIX-7797).
- [#123](https://github.com/1024pix/pix-editor/pull/123) [FEATURE] Pouvoir créer un nouveau test statique (PIX-3635).

### :building_construction: Tech
- [#124](https://github.com/1024pix/pix-editor/pull/124) [TECH] Migration vers embroider.
- [#134](https://github.com/1024pix/pix-editor/pull/134) [TECH] Désactivation de google analytics dans TUI editor.
- [#133](https://github.com/1024pix/pix-editor/pull/133) [TECH] Réparer CircleCI (Fail sur Install ChromeDriver).

### :bug: Correction
- [#131](https://github.com/1024pix/pix-editor/pull/131) [BUGFIX] design des pages de tests statiques revu (PIX-8586).
- [#128](https://github.com/1024pix/pix-editor/pull/128) [BUGFIX] L'utilisateur ne pouvait plus créer de domaine (PIX-8612).
- [#126](https://github.com/1024pix/pix-editor/pull/126) [BUGFIX] Le lien de PixEditor vers Airtable est invalide.

### :coffee: Autre
- [#136](https://github.com/1024pix/pix-editor/pull/136) [BUMP] Update dependency qs to v6.10.3 [SECURITY].
- [#137](https://github.com/1024pix/pix-editor/pull/137) [BUMP] Update dependency tough-cookie to v4.1.3 [SECURITY].
- [#135](https://github.com/1024pix/pix-editor/pull/135) Configure Renovate.

## v3.85.0 (10/07/2023)


### :rocket: Amélioration
- [#125](https://github.com/1024pix/pix-editor/pull/125) [FEATURE] Empêcher les utilisateurs avec un rôle "readpixonly" d'accéder aux fonctionnalités liées aux tests statiques (PIX-8589).

## v3.84.0 (10/07/2023)


### :rocket: Amélioration
- [#121](https://github.com/1024pix/pix-editor/pull/121) [FEATURE] Pouvoir voir le détail d'un test statique sur PixEditor (PIX-7796).
- [#117](https://github.com/1024pix/pix-editor/pull/117) [FEATURE] Pouvoir voir la liste paginée des tests statiques sur PixEditor (PIX-7795).

## v3.83.0 (28/06/2023)


### :building_construction: Tech
- [#116](https://github.com/1024pix/pix-editor/pull/116) [TECH] Mettre en place la double lecture de tests statiques lors de la création de la release (PIX-8383).

### :bug: Correction
- [#118](https://github.com/1024pix/pix-editor/pull/118) [BUGFIX] La "Duplication vers" d'un acquis pour le passer d'un sujet à un autre ne fonctionne pas (PIX-8485).

## v3.82.1 (16/06/2023)


### :rocket: Amélioration
- [#112](https://github.com/1024pix/pix-editor/pull/112) [FEATURE] Reprise de données pour afficher aléatoirement les anciens QCU/QCM (PIX-7876).
- [#114](https://github.com/1024pix/pix-editor/pull/114) [FEATURE] Créer la table des tests statiques (PIX-7792).
- [#113](https://github.com/1024pix/pix-editor/pull/113) [FEATURE] Renvoit le fichier index.html en cas de 404 (PIX-8350).

### :bug: Correction
- [#115](https://github.com/1024pix/pix-editor/pull/115) [BUGFIX] Le focus sur les modales est défaillant depuis la mise à jour de PixUi (PIX-8351).

## v3.82.0 (13/06/2023)


### :rocket: Amélioration
- [#111](https://github.com/1024pix/pix-editor/pull/111) [FEATURE] Afficher les domaines ordonnés par code (PIX-8216).

### :building_construction: Tech
- [#109](https://github.com/1024pix/pix-editor/pull/109) [TECH] Mettre à jour PixUi à la version v35.0.0.
- [#110](https://github.com/1024pix/pix-editor/pull/110) [TECH] Mettre en place ember-simple-auth sur PixEditor (PIX-8232).
- [#108](https://github.com/1024pix/pix-editor/pull/108) [TECH] Mise à jour ember v4 (PIX-8190).

## v3.81.0 (16/05/2023)


### :rocket: Amélioration
- [#107](https://github.com/1024pix/pix-editor/pull/107) [FEATURE] Permettre de choisir si on veut afficher aléatoirement les options des QCU/QCM (PIX-7737)

## v3.80.0 (09/05/2023)


### :building_construction: Tech
- [#106](https://github.com/1024pix/pix-editor/pull/106) [TECH] Configurer le pool minimal de connexion à 0

## v3.79.0 (04/05/2023)


### :rocket: Amélioration
- [#104](https://github.com/1024pix/pix-editor/pull/104) [FEATURE] Ajouté le nom de la compétence dans le résultat du check des URL (PIX-6042).

### :building_construction: Tech
- [#105](https://github.com/1024pix/pix-editor/pull/105) [TECH] Corriger l'ajout d'une source contenant une apostrophe (PIX-7819) 
- [#101](https://github.com/1024pix/pix-editor/pull/101) [TECH] Renseigner la bonne version de node dans le fichier .nvmrc

### :bug: Correction
- [#103](https://github.com/1024pix/pix-editor/pull/103) [BUGFIX] Les logs système ne sont pas désactivables

## v3.78.0 (31/03/2023)


### :rocket: Amélioration
- [#98](https://github.com/1024pix/pix-editor/pull/98) [FEATURE] Mise a jour de la doc de rédaction de proposition sur pix éditor (PIX-7520).

### :building_construction: Tech
- [#99](https://github.com/1024pix/pix-editor/pull/99) [TECH] Vérifier la validités des liens contenu dans les bonnes réponses des épreuves (PIX-6190).
- [#100](https://github.com/1024pix/pix-editor/pull/100) [TECH] Passage à node 16

## v3.77.0 (20/03/2023)


### :rocket: Amélioration
- [#97](https://github.com/1024pix/pix-editor/pull/97) [FEATURE] Add default selected value on geographic field (PIX-3590)
- [#96](https://github.com/1024pix/pix-editor/pull/96) [FEATURE] Mise à jour des dépendances

### :building_construction: Tech
- [#95](https://github.com/1024pix/pix-editor/pull/95) [TECH] Active des règles de lint SCSS d'espacement

## v3.76.0 (17/02/2023)


### :rocket: Amélioration
- [#90](https://github.com/1024pix/pix-editor/pull/90) [FEATURE] Ajouter la date de péremption d'une épreuve (PIX-7022)
- [#89](https://github.com/1024pix/pix-editor/pull/89) [FEATURE] Ajouter la date d'archivage dans Airtable à l'archivage d'une épreuve (PIX-6543)
- [#88](https://github.com/1024pix/pix-editor/pull/88) [FEATURE] Ajouter la date de validation d'une épreuve dans la table d'Airtable "Epreuves" (PIX-6541)

### :building_construction: Tech
- [#93](https://github.com/1024pix/pix-editor/pull/93) [TECH] Exposer les nouveaux champs de Airtable depuis LCMS (PIX-7121).
- [#94](https://github.com/1024pix/pix-editor/pull/94) [TECH] Mise en place de Stylelint
- [#91](https://github.com/1024pix/pix-editor/pull/91) [TECH] Récupérer les dates de : mise en production, archivage et obsolescence des épreuves en se basant sur le Changelog et les releases (PIX-5210)
- [#83](https://github.com/1024pix/pix-editor/pull/83) [TECH] Ne pas lancer le check des URL lors de la création d'une release en dehors de l'environnement de production (PIX-6878).

## v3.75.1 (23/01/2023)


### :building_construction: Tech
- [#85](https://github.com/1024pix/pix-editor/pull/85) [TECH] Déplace la création de release dans un process dédié

## v3.75.0 (23/01/2023)


### :bug: Correction
- [#82](https://github.com/1024pix/pix-editor/pull/82) [BUGFIX] Réparer la génération du fichier pdf de présentation du référentiel (PIX-6781).

### :coffee: Autre
- [#77](https://github.com/1024pix/pix-editor/pull/77) [CLEANUP] Supprime la compatibilité avec l'ancien format pour les textes traduits

## v3.74.0 (27/12/2022)


### :building_construction: Tech
- [#76](https://github.com/1024pix/pix-editor/pull/76) [TECH] Mettre à jour les paquets non problématiques de Pix Editor (PIX-6461).

## v3.73.2 (27/12/2022)


### :building_construction: Tech
- [#79](https://github.com/1024pix/pix-editor/pull/79) [TECH] Tracer facilement les métriques infra
- [#80](https://github.com/1024pix/pix-editor/pull/80) [TECH] Ne plus ajouter de lien vers la review-app dans la pull-request
- [#75](https://github.com/1024pix/pix-editor/pull/75) [TECH] Mettre a jour le port utiliser par la base de donnée dans les variables d'environnement.

## v3.73.1 (25/11/2022)


### :bug: Correction
- [#74](https://github.com/1024pix/pix-editor/pull/74) [BUGFIX] Les images des épreuves ne sont plus présentes dans le payload de récupération de releases (PIX-6394)

## v3.73.0 (23/11/2022)


### :rocket: Amélioration
- [#73](https://github.com/1024pix/pix-editor/pull/73) [FEATURE] Ajouter les liens vers la thématique parente et les acquis enfants sur le modèle Tube de la release (PIX-6331)
- [#69](https://github.com/1024pix/pix-editor/pull/69) [FEATURE] Ajouter les informations de compatibilité Smartphone/Tablette au niveau des sujets (PIX-6128)

### :building_construction: Tech
- [#72](https://github.com/1024pix/pix-editor/pull/72) [TECH] Ajout d'attribut dictionnaire i18n sur les modèles de la Release (PIX-5731)
- [#71](https://github.com/1024pix/pix-editor/pull/71) [TECH] Sépare les modèles d'édition avec ceux destinés à la release dans l'API (PIX-6148)

## v3.72.1 (25/10/2022)


### :bug: Correction
- [#70](https://github.com/1024pix/pix-editor/pull/70) [BUGFIX] Améliorer le libellé indiquant la présence d'une alternative textuelle sur les illustrations dans une épreuve

## v3.72.0 (25/10/2022)


### :building_construction: Tech
- [#68](https://github.com/1024pix/pix-editor/pull/68) [TECH] Suppression des formations (PIX-5777)

## v3.71.0 (10/10/2022)


### :rocket: Amélioration
- [#67](https://github.com/1024pix/pix-editor/pull/67) [FEATURE] Ne pas afficher le champ de recherche pour les utilisateurs `READ_PIX_ONLY` (PIX-5819). 

## v3.70.0 (26/09/2022)


### :rocket: Amélioration
- [#65](https://github.com/1024pix/pix-editor/pull/65) [FEATURE] Ne pas afficher le générateur de profile cible pour les utilisateur `READ_PIX_ONLY` (PIX-5671).

### :building_construction: Tech
- [#66](https://github.com/1024pix/pix-editor/pull/66) [TECH] Mise a jour caniuse-lite (PIX-5719).

## v3.69.1 (06/09/2022)


### :rocket: Amélioration
- [#64](https://github.com/1024pix/pix-editor/pull/64) [FEATURE] Ajouter les rôles manquants adminJs.

## v3.69.0 (06/09/2022)


### :rocket: Amélioration
- [#63](https://github.com/1024pix/pix-editor/pull/63) [FEATURE] Ajout d'un nouveau rôle pour limiter l’accès au référentiel pix (PIX-5618).

## v3.68.0 (06/09/2022)


### :building_construction: Tech
- [#55](https://github.com/1024pix/pix-editor/pull/55) [TECH] Mettre à jour AdminBro vers AdminJS (PIX-5433).
- [#58](https://github.com/1024pix/pix-editor/pull/58) [TECH] Utilise l'automerge 1024pix.

### :bug: Correction
- [#62](https://github.com/1024pix/pix-editor/pull/62) [BUGFIX] Corrige l'enrichissement des logs de requêtes

### :coffee: Autre
- [#61](https://github.com/1024pix/pix-editor/pull/61) [CLEANUP] Met à jour l'action d'auto merge commune
- [#59](https://github.com/1024pix/pix-editor/pull/59) [CLEANUP] Correction du badge circleci dans le readme

## v3.67.0 (03/08/2022)


### :rocket: Amélioration
- [#57](https://github.com/1024pix/pix-editor/pull/57) [FEATURE] Ajouter les formations à la release (PIX-5436).
- [#56](https://github.com/1024pix/pix-editor/pull/56) [FEATURE] Créé l'entité training sur le PG LCMS (PIX-5418)

## v3.66.2 (20/06/2022)


### :bug: Correction
- [#54](https://github.com/1024pix/pix-editor/pull/54) [BUGFIX] Permettre la duplication d'un acquis avec ses épreuves.

## v3.66.1 (14/06/2022)


### :bug: Correction
- [#53](https://github.com/1024pix/pix-editor/pull/53) [BUGFIX] Correction de duplication d'un acquis.

## v3.66.0 (05/05/2022)


### :rocket: Amélioration
- [#52](https://github.com/1024pix/pix-editor/pull/52) [FEATURE] Exposer le niveau des acquis dans la release

## v3.65.0 (28/04/2022)


### :building_construction: Tech
- [#51](https://github.com/1024pix/pix-editor/pull/51) [TECH] Ajouter le champ du nom de la thématique traduite en anglais dans la release (PIX-4855).

## v3.64.0 (06/04/2022)


### :building_construction: Tech
- [#30](https://github.com/1024pix/pix-editor/pull/30) [TECH] Mise a jour d'Ember en 3.26.1 (PIX-4314).

## v3.63.5 (30/03/2022)


### :bug: Correction
- [#50](https://github.com/1024pix/pix-editor/pull/50) [BUGFIX] Réparer le rafraîchissement du jeton du seau OVH (PIX-4659).

## v3.63.4 (15/03/2022)


### :bug: Correction
- [#47](https://github.com/1024pix/pix-editor/pull/47) [BUGFIX] Attribuer la bonne relation épreuves > acquis dans nos scriptes

## v3.63.3 (15/03/2022)


### :building_construction: Tech
- [#46](https://github.com/1024pix/pix-editor/pull/46) [TECH] Ajout du trigramme de l'utilisateur dans les rapports de Sentry.

### :bug: Correction
- [#45](https://github.com/1024pix/pix-editor/pull/45) [BUGFIX] Corriger la déconnexion d'une page

### :coffee: Autre
- [#44](https://github.com/1024pix/pix-editor/pull/44) [DOC] Ajouter de la documentation au script `populate-alpha-and-delta-column`
- [#40](https://github.com/1024pix/pix-editor/pull/40) [CLEANUP] Supprime la propriété skillIds de la release

## v3.63.2 (07/03/2022)


### :bug: Correction
- [#43](https://github.com/1024pix/pix-editor/pull/43) [BUGFIX] Réparer la création d'une nouvelle version d'un prototype (PIX-4476)

## v3.63.1 (02/03/2022)


### :bug: Correction
- [#41](https://github.com/1024pix/pix-editor/pull/41) [BUGFIX]  Réparer le déplacement d'un prototype (PIX-4476).

## v3.63.0 (23/02/2022)


### :rocket: Enhancement
- [#39](https://github.com/1024pix/pix-editor/pull/39) [FEATURE] Pouvoir modifier une épreuve archivée depuis pix editor (PIX-442).
- [#35](https://github.com/1024pix/pix-editor/pull/35) [FEATURE] Ajouter une vue 'en construction' pour la section acquis (PIX-3588).

### :building_construction: Tech
- [#36](https://github.com/1024pix/pix-editor/pull/36) [TECH] Corriger le nom des fichiers des pièces jointes au moment de la création d'une épreuve (PIX-4018)
- [#34](https://github.com/1024pix/pix-editor/pull/34) [TECH] Renommer la clé d'api admin

### :coffee: Various
- [#37](https://github.com/1024pix/pix-editor/pull/37) [CLEANUP] Modifie la relation challenge -> skill en 1 -> 1 (PIX-4290)

## v3.62.0 (11/02/2022)


### :bug: Bug fix
- [#33](https://github.com/1024pix/pix-editor/pull/33) [BUGFIX] Le titre du bouton valider lorsqu'on met en production une épreuve en "proposée" ne possède pas de traduction.
- [#32](https://github.com/1024pix/pix-editor/pull/32) [BUGFIX] Le titre de la popIn qui s'affiche lors de la modification d'un acquis ne possède pas de traduction (PIX-4352).

## v3.61.0 (09/02/2022)


### :rocket: Enhancement
- [#31](https://github.com/1024pix/pix-editor/pull/31) [FEATURE] Modification de la popin de changelog lors de la modification
- [#28](https://github.com/1024pix/pix-editor/pull/28) [FEATURE] Expose les différentiels référentiels dans la release  
- [#26](https://github.com/1024pix/pix-editor/pull/26) [FEATURE] Permettre l'extraction de la liste des sujet en anglais (PIX-4156).

### :building_construction: Tech
- [#29](https://github.com/1024pix/pix-editor/pull/29) [TECH] Exposer la relation Skill -> Challenge sous forme de 1 -> N plutot que N <-> N

### :coffee: Various
- [#9](https://github.com/1024pix/pix-editor/pull/9) [BUG FIX] Archiver ou rendre obsolète un prototype actif crée un soucis dans la gestion du statut de son acquis (PIX 4064)

## v3.60.0 (28/01/2022)


### :rocket: Enhancement
- [#23](https://github.com/1024pix/pix-editor/pull/23) [FEATURE]  Affichage du nom des thématiques en anglais (PIX-4258)

### :building_construction: Tech
- [#24](https://github.com/1024pix/pix-editor/pull/24) [TECH] Ajout de la généalogie d'une épreuve (PIX-4271).

### :coffee: Various
- [#22](https://github.com/1024pix/pix-editor/pull/22) [CLEANUP] Corrige le chemin des tests unitaires des datasources
- [#21](https://github.com/1024pix/pix-editor/pull/21) [DOC] Améliorer la documentation (`sample.env`, `README.md`, `INSTALL.md`).

## v3.59.0 (21/01/2022)


### :building_construction: Tech
- [#20](https://github.com/1024pix/pix-editor/pull/20) [TECH] Ajouter le champ responsive d'une épreuve a la release du référentiel (PIX-4202).

## v3.58.2 (21/01/2022)


### :bug: Bug fix
- [#19](https://github.com/1024pix/pix-editor/pull/19) [BUGFIX] Corriger la preview des nouvelles épreuves sur la recette (PIX-4181).

## v3.58.1 (19/01/2022)


### :bug: Bug fix
- [#18](https://github.com/1024pix/pix-editor/pull/18) |BUGFIX] Corrige certaines urls injustement marqué comme invalides

## v3.58.0 (17/01/2022)


### :rocket: Enhancement
- [#16](https://github.com/1024pix/pix-editor/pull/16) [FEATURE] Ajout de contexte sur l'extractFromAirtable des URLs du référentiel (PIX-4154)

### :bug: Bug fix
- [#17](https://github.com/1024pix/pix-editor/pull/17) [BUGFIX] Corrige la concurrence de vérifications des URLs

### :coffee: Various
- [#15](https://github.com/1024pix/pix-editor/pull/15) [CLEANUP] Supprime la gestion des status pré-validé et validé sans test des épreuves (PIX-4126)

## v3.57.0 (11/01/2022)


### :rocket: Enhancement
- [#14](https://github.com/1024pix/pix-editor/pull/14) [FEATURE] Met à jour le wording de mise en obsolescence des acquis (PIX-4092)

### :building_construction: Tech
- [#12](https://github.com/1024pix/pix-editor/pull/12) [TECH] Utilise notre propre vérificateur d'URLs en erreur
- [#11](https://github.com/1024pix/pix-editor/pull/11) [TECH] Ajout du numéro de job dans les logs 

### :bug: Bug fix
- [#13](https://github.com/1024pix/pix-editor/pull/13) [BUGFIX] Corrige la taille du bouton dropdown pour changer le statut d'un acquis/épreuve

## v3.56.0 (28/12/2021)


### :rocket: Enhancement
- [#10](https://github.com/1024pix/pix-editor/pull/10) [FEATURE] Ajout de l'information de la relation competence -> thematique (PIX-3948)

## v3.55.0 (27/12/2021)


### :rocket: Enhancement
- [#3](https://github.com/1024pix/pix-editor/pull/3) [FEATURE] Extraire les urls depuis le référentiel Pix
- [#7](https://github.com/1024pix/pix-editor/pull/7) [FEATURE] Importer une sélection de sujets généré depuis Pix Orga vers Pix Editor (PIX-3958).
- [#6](https://github.com/1024pix/pix-editor/pull/6) [FEATURE] Uniformiser le wording de suppression d'épreuve

### :building_construction: Tech
- [#5](https://github.com/1024pix/pix-editor/pull/5) [TECH] Supprime les commentaires inutiles dans les modèles

### :bug: Bug fix
- [#8](https://github.com/1024pix/pix-editor/pull/8) [BUGFIX] Corrige des erreurs lors de l'archivage ou de obsolescence d'une épreuve
- [#2](https://github.com/1024pix/pix-editor/pull/2) [BUGFIX] Corrige la configuration des notifications slack

### :coffee: Various
- [#4](https://github.com/1024pix/pix-editor/pull/4) [DOC] Mise à jour du README
- [#1](https://github.com/1024pix/pix-editor/pull/1) [CLEANUP] Supprime l'information de scoring

## v3.54.0 (08/12/2021)


### :building_construction: Tech
- [#246](https://github.com/1024pix/pix-editor/pull/246) [TECH] Ajouter les thématiques dans release (PIX-3943) 

### :coffee: Various
- [#247](https://github.com/1024pix/pix-editor/pull/247) [SPEEEEEED] Rend beaucoup plus rapide la page de génération des profils cibles

## v3.53.0 (26/11/2021)


### :rocket: Enhancement
- [#245](https://github.com/1024pix/pix-editor/pull/245) [FEATURE] Versioner l'acquis dans le référentiel (PIX-3901)

## v3.52.2 (15/11/2021)


### :building_construction: Tech
- [#244](https://github.com/1024pix/pix-editor/pull/244) [TECH] Expliciter la journalisation des métriques OPS.
- [#242](https://github.com/1024pix/pix-editor/pull/242) [TECH] Déplace le travail asynchrone de vérification des URLs dans son propre processus

## v3.52.1 (08/11/2021)


### :building_construction: Tech
- [#243](https://github.com/1024pix/pix-editor/pull/243) [TECH] Arrêtons le mensonge dans le message au moment d'arrêter le serveur API

### :bug: Bug fix
- [#241](https://github.com/1024pix/pix-editor/pull/241) [BUGFIX] Corrige la validation du champ réponse

## v3.52.0 (03/11/2021)


### :rocket: Enhancement
- [#237](https://github.com/1024pix/pix-editor/pull/237) [FEATURE] Ajout de contexte pour la vérifications des URLs KO
- [#240](https://github.com/1024pix/pix-editor/pull/240) [FEATURE] Valide le champ réponses d'une épreuve (PIX-3747)

### :building_construction: Tech
- [#239](https://github.com/1024pix/pix-editor/pull/239) [TECH] Désactive les notifications de succès de la création de référentiel lorsqu'elle est prévue
- [#238](https://github.com/1024pix/pix-editor/pull/238) [TECH] Mise à jour vers bull 4

## v3.51.0 (20/10/2021)

- [#236](https://github.com/1024pix/pix-editor/pull/236) [FEATURE] A la recherche des URLs des tutorials cassées (PIX-3581)
- [#235](https://github.com/1024pix/pix-editor/pull/235) [BUGFIX] Corrige une typo

## v3.50.0 (19/10/2021)

- [#234](https://github.com/1024pix/pix-editor/pull/234) [FEATURE] Mise en ligne automatique des urls KO dans un google sheet (PIX-3580).
- [#230](https://github.com/1024pix/pix-editor/pull/230) [FEATURE] Vérifier les urls des épreuves
- [#232](https://github.com/1024pix/pix-editor/pull/232) [TECH] Monté de version d'axios
- [#233](https://github.com/1024pix/pix-editor/pull/233) [TECH] Monter les BDD de développement en version majeure 13.3 depuis la 12.3.

## v3.49.0 (12/10/2021)

- [#231](https://github.com/1024pix/pix-editor/pull/231) [FEATURE] Recherche de tutoriel par multiple tags
- [#229](https://github.com/1024pix/pix-editor/pull/229) [FEATURE] Pouvoir modifier les tutoriels
- [#227](https://github.com/1024pix/pix-editor/pull/227) [TECH] Monter de version caniuse-lite

## v3.48.0 (07/10/2021)

- [#228](https://github.com/1024pix/pix-editor/pull/228) [BUGFIX] Permettre le remplacement d'une illustration

## v3.47.0 (06/10/2021)

- [#226](https://github.com/1024pix/pix-editor/pull/226) [FEATURE] Ajout de la date de dernière modification dans les épreuves
- [#225](https://github.com/1024pix/pix-editor/pull/225) [TECH] Préparer LCMS à l'utilisation par pix-db-replication
- [#223](https://github.com/1024pix/pix-editor/pull/223) [TECH] Mise a jour des dépendances de l'API.

## v3.46.0 (21/09/2021)

- [#220](https://github.com/1024pix/pix-editor/pull/220) [TECH] Remplacer Bunyan et les plugins Good, Good-console, Good-squeeze qui ont été dépréciées par Pino et Hapi-pino (PIX-3451)
- [#214](https://github.com/1024pix/pix-editor/pull/214) [TECH] Ajouter des modèles de données
- [#222](https://github.com/1024pix/pix-editor/pull/222) [TECH] Montée de version de node (v14.17.6).
- [#221](https://github.com/1024pix/pix-editor/pull/221) [TECH] Configure le nombre d'essai pour créer une release

## v3.45.0 (13/09/2021)

- [#217](https://github.com/1024pix/pix-editor/pull/217) [FEATURE] Ajouter le statut et la version d'un acquis dans le résultat de recherche (PIX-3206)
- [#218](https://github.com/1024pix/pix-editor/pull/218) [BUGFIX] Corrige le renommage des pièces jointes
- [#219](https://github.com/1024pix/pix-editor/pull/219) [TECH] Met à jour le wording des notifications slack
- [#211](https://github.com/1024pix/pix-editor/pull/211) [DOC] Enrichir le README avec les infos de connexion en local

## v3.44.0 (09/09/2021)

- [#212](https://github.com/1024pix/pix-editor/pull/212) [FEATURE] Notifier d'une création d'une release du contenus pédagogique. 

## v3.43.2 (08/09/2021)

- [#216](https://github.com/1024pix/pix-editor/pull/216) [FEATURE] Change le texte du bouton pour uploader une illustration lorsqu'il y a déjà une
- [#215](https://github.com/1024pix/pix-editor/pull/215) [TECH] Change le niveau de log de debug a info

## v3.43.1 (30/08/2021)

- [#210](https://github.com/1024pix/pix-editor/pull/210) [FEATURE] Ajouter la syntaxe du menu déroulant dans l'infobulle d'aide (PE-79).
- [#213](https://github.com/1024pix/pix-editor/pull/213) [BUGFIX] Correction de la recherche d'épreuves par id

## v3.43.0 (30/08/2021)

- [#209](https://github.com/1024pix/pix-editor/pull/209) [FEATURE] Préfixe l'id persistant des modèles par leur type
- [#208](https://github.com/1024pix/pix-editor/pull/208) [BUGFIX] Correction du script de copie d'acquis pour les épreuves focus
- [#206](https://github.com/1024pix/pix-editor/pull/206) [TECH] Ajout d'un script permettant de passer des épreuves en focus via une liste d'acquis (PIX-2962).
- [#207](https://github.com/1024pix/pix-editor/pull/207) [TECH] Ajout d'un linter dans le dossier scripts

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


