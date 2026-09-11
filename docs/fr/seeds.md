# Seeds

## Vue d'ensemble

Les seeds peuplent la base de données avec des données de développement réalistes. 
Ces seeds sont de bons exemples pour s'approprier les modèles de données et implémenter son propre référentiel.
Ils sont pilotés par `api/db/seeds/seed.js` et utilisent la même factory `DatabaseBuilder` que la suite de tests.

## Hiérarchie du contenu pédagogique

Les données sont construites de haut en bas dans une structure arborescente, chaque niveau étant rattaché à son parent :

```
Référentiel → Domaine → Compétence → Thématique → Sujet → Acquis → Épreuve
```

Chaque constructeur reçoit l'arbre `learningContentData` en cours de construction afin de lier les éléments à leurs parents. Les identifiants sont déterministes (ex. `areaF0A1`, `skillF0A1C0T0S2Act`, `challengeF0A1C0T0S2Ch0`).

## Génération des acquis

Les acquis sont générés par paires pour chaque niveau dans un sujet :

| Parité de l'index | Acquis 1 | Acquis 2 |
|---|---|---|
| Pair | `actif` v1 | `en construction` v2 |
| Impair | `périmé` v1 | `archivé` v2 |

Les sujets dont le nom contient `workbench` reçoivent un unique acquis workbench (`en construction`) à la place.

## Génération des épreuves

Le nombre et les statuts des épreuves générées par acquis dépendent du statut de l'acquis :

| Statut de l'acquis | Épreuves créées |
|---|---|
| `en construction` | 1 proto `proposée` + 1 décli `proposée` + 1 décli `périmée` |
| `actif` | 1 proto `validée` + 1 décli `validée` + 1 décli `périmée` + 1 décli `archivée` |
| `archivé` | 1 proto `archivée` + 1 décli `archivée` + 1 décli `périmée` |
| `périmé` | 2 `périmées` |

Les attributs des épreuves (type, format, accessibilité, etc.) sont cyclés sur l'ensemble des valeurs d'énumération à l'aide du générateur `cycle()` de `data/utils.js`, garantissant une couverture large sans spécification manuelle.

Des traductions sont créées pour chaque langue de `SEEDS_LOCALES` pour chaque épreuve.

## Autres constructeurs

| Fichier | Description |
|---|---|
| `data/tags.js` | Liste fixe de tags |
| `data/tutorials.js` | Liste fixe de tutoriels, répartis sur les acquis |
| `data/pix-1d.js` | Référentiel Pix 1D, construit indépendamment de `seedsConfig` |
| `data/modules.js` | Lit les fichiers JSON de `data/modules/*.json` et les insère tels quels |
| `data/static-courses.js` | Ensemble fixe de parcours statiques |
| `data/whitelisted-urls.js` | Ensemble fixe d'URLs autorisées |

## Utilisateurs seeds

Quatre utilisateurs sont toujours créés :

| Trigramme | Rôle | Source de la clé API |
|---|---|---|
| `DEV` | admin | `REVIEW_APP_ADMIN_USER_API_KEY` ou valeur par défaut codée en dur |
| `EDI` | editor | `REVIEW_APP_EDITOR_USER_API_KEY` ou valeur par défaut codée en dur |
| `RPO` | readpixonly | `REVIEW_APP_READ_PIX_ONLY_USER_API_KEY` ou valeur par défaut codée en dur |
| `LOL` | readonly | `REVIEW_APP_READ_ONLY_USER_API_KEY` ou valeur par défaut codée en dur |

Les clés API codées en dur ne sont actives que lorsque la variable `REVIEW_APP` n'est pas définie.

## Configuration

Le nombre d'enregistrements est contrôlé par des variables d'environnement (définies dans `lib/config.js` via `seedsConfig`) :

| Variable d'environnement | Défaut | Signification |
|---|---|---|
| `SEEDS_CNT_FRAMEWORKS` | 2 | Nombre de référentiels |
| `SEEDS_CNT_AREAS` | 2 | Domaines par référentiel |
| `SEEDS_CNT_COMPETENCES` | 2 | Compétences par domaine |
| `SEEDS_CNT_THEMATICS` | 2 | Thématiques par compétence |
| `SEEDS_CNT_TUBES` | 2 | Sujets par thématique |
| `SEEDS_SKILL_LEVEL` | 3 | Niveau maximum des acquis par sujet |
| `SEEDS_LOCALES` | `['fr','en']` | Langues pour les traductions |

