# API

## Stack

Construit avec **Hapi.js** sur Node.js, **PostgreSQL** comme base de données (via Knex pour les migrations et les requêtes), et **Bull/Redis** pour les files de traitement en arrière-plan.

## Architecture

Suit une architecture en couches :
- **`lib/application/`** — gestionnaires de routes et validation Joi
- **`lib/domain/`** — cas d'usage, modèles, services métier
- **`lib/infrastructure/`** — dépôts (accès aux données), sérialiseurs JSON:API, plugins

## Domaine

Le modèle de contenu central représente le référentiel pédagogique Pix :

**Hiérarchie du référentiel** : Référentiel → Domaine → Compétence → Thématique → Sujet → Acquis → Épreuve

Autres entités : `LocalizedChallenge` (variantes par langue), `Tutorial`, `Tag`, `Module`/`DraftModule`, `Mission`, `Attachment`, `Release`, `Note`, `Translation`.

## Principaux endpoints

| Groupe | Chemins |
|---|---|
| Contenu du référentiel | `/api/areas`, `/api/competences`, `/api/skills`, `/api/challenges`, `/api/tubes`, `/api/thematics` |
| Modules | `/api/modules`, `/api/draft-modules`, `/api/module-summaries` |
| Missions | `/api/missions` |
| Localisation | `/api/translations.csv`, `/api/localized-challenges` |
| Releases | `/api/releases`, `/api/current-content`, `/api/replication-data` |
| Administration | `/api/admin` |
| Divers | `/api/search`, `/api/attachments`, `/api/healthcheck` |

## Authentification

Schéma d'authentification Hapi personnalisé avec des clés API. La plupart des routes nécessitent une vérification des droits d'écriture via `securityPreHandlers.checkUserHasWriteAccess`.

## Tâches en arrière-plan (Bull/Redis)

- `release-job` — crée des instantanés versionnés du contenu
- `upload-translation-job` — synchronise les traductions vers le service de traduction Phrase.com
- `check-urls-job` — valide la disponibilité des URLs externes
- `export-external-url-list-job` — exporte vers Google Sheets

- `release-table-cleaning-and-retention-job` — suppression des anciens instantanés versionnés 

## Intégrations notables

- **Phrase.** — gestion des traductions externes (import/export CSV, webhook)
- **Slack** — notifications via webhook
