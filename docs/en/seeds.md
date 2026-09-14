# Seeds

## Overview

Seeds populate the database with realistic development data. 
They are good examples for understanding the data models and implementing your own framework. 
They are driven by `api/db/seeds/seed.js` and use the same `DatabaseBuilder` factory as the test suite.

## Learning Content Hierarchy

Data is built top-down in a tree structure, with each level attached to its parent:

```
Framework → Area → Competence → Thematic → Tube → Skill → Challenge
```

Each builder receives the running `learningContentData` tree so it can link items to their parents. IDs are deterministic (e.g. `areaF0A1`, `skillF0A1C0T0S2Act`, `challengeF0A1C0T0S2Ch0`).

## Skill Generation Pattern

Skills are generated in pairs per level index within each tube:

| Index parity | Skill 1 | Skill 2 |
|---|---|---|
| Even | `actif` v1 | `en construction` v2 |
| Odd | `périmé` v1 | `archivé` v2 |

Tubes whose name contains `workbench` receive a single workbench skill (`en construction`) instead.

## Challenge Generation Pattern

The number and statuses of challenges generated per skill depend on the skill's status:

| Skill status | Challenges created |
|---|---|
| `en construction` | 1 `proposée` proto + 1 `proposée` décli + 1 `périmée` décli |
| `actif` | 1 `validée` proto + 1 `validée` décli + 1 `périmée` décli + 1 `archivée` décli |
| `archivé` | 1 `archivée` proto + 1 `archivée` décli + 1 `périmée` décli |
| `périmé` | 2 `périmées` |

Challenge attributes (type, format, accessibility, etc.) are cycled through all enum values using the `cycle()` generator from `data/utils.js`, ensuring broad coverage without manual specification.

Translations are created for every locale in `SEEDS_LOCALES` for each challenge.

## Other Builders

| File | Description |
|---|---|
| `data/tags.js` | Fixed list of tags |
| `data/tutorials.js` | Fixed list of tutorials, distributed across skills |
| `data/pix-1d.js` | Pix 1D framework, built independently of `seedsConfig` |
| `data/modules.js` | Reads JSON files from `data/modules/*.json` and inserts them as-is |
| `data/static-courses.js` | Fixed set of static courses |
| `data/whitelisted-urls.js` | Fixed set of whitelisted URLs |

## Seed Users

Four users are always created:

| Trigram | Role | API key source |
|---|---|---|
| `DEV` | admin | `REVIEW_APP_ADMIN_USER_API_KEY` or hardcoded default |
| `EDI` | editor | `REVIEW_APP_EDITOR_USER_API_KEY` or hardcoded default |
| `RPO` | readpixonly | `REVIEW_APP_READ_PIX_ONLY_USER_API_KEY` or hardcoded default |
| `LOL` | readonly | `REVIEW_APP_READ_ONLY_USER_API_KEY` or hardcoded default |

Hardcoded API keys are only active when `REVIEW_APP` is not set.

## Configuration

All record counts are controlled by environment variables (defined in `lib/config.js` as `seedsConfig`):

| Env var | Default | Meaning |
|---|---|---|
| `SEEDS_CNT_FRAMEWORKS` | 2 | Number of frameworks |
| `SEEDS_CNT_AREAS` | 2 | Areas per framework |
| `SEEDS_CNT_COMPETENCES` | 2 | Competences per area |
| `SEEDS_CNT_THEMATICS` | 2 | Thematics per competence |
| `SEEDS_CNT_TUBES` | 2 | Tubes per thematic |
| `SEEDS_SKILL_LEVEL` | 3 | Max skill levels per tube |
| `SEEDS_LOCALES` | `['fr','en']` | Locales for translations |


