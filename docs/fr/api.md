# API

## Stack

Construit avec **Hapi.js** sur Node.js, **PostgreSQL** comme base de données (via Knex pour les migrations et les requêtes), et **Bull/Redis** pour les files de traitement en arrière-plan.

## Architecture

Suit une architecture en couches :
- **`lib/application/`** — gestionnaires de routes et validation Joi (27 modules de routes)
- **`lib/domain/`** — cas d'usage, modèles, services métier
- **`lib/infrastructure/`** — dépôts (accès aux données), sérialiseurs JSON:API, plugins

## Domaine

Le modèle de contenu central représente le référentiel pédagogique Pix :

**Hiérarchie du référentiel** : Framework → Domaine → Compétence → Thématique → Sujet → Acquis → Épreuve

Autres entités : `LocalizedChallenge` (variantes par langue), `Tutorial`, `Tag`, `Module`/`DraftModule`, `Mission`, `Attachment`, `Release`, `Note`, `Translation`.

## Principaux endpoints

| Groupe | Chemins |
|---|---|
| Contenu du référentiel | `/api/areas`, `/competences`, `/skills`, `/challenges`, `/tubes`, `/thematics` |
| Modules | `/api/modules`, `/api/draft-modules`, `/api/module-summaries` |
| Missions | `/api/missions` |
| Localisation | `/api/translations.csv`, `/api/localized-challenges` |
| Releases | `/api/releases`, `/api/current-content`, `/api/replication-data` |
| Administration | `/api/admin` (panneau AdminJS) |
| Divers | `/api/search`, `/api/attachments`, `/api/healthcheck` |

## Authentification

Schéma d'authentification Hapi personnalisé avec des clés API. La plupart des routes nécessitent une vérification des droits d'écriture via `securityPreHandlers.checkUserHasWriteAccess`.

## Tâches en arrière-plan (Bull/Redis)

- `release-job` — crée des instantanés versionnés du contenu
- `upload-translation-job` — synchronise avec le service de traduction Phrase.io
- `check-urls-job` — valide les URLs externes
- `export-external-url-list-job` — exporte vers Google Sheets
- `release-table-cleaning-and-retention-job` — maintenance de la base de données

## Intégrations notables

- **Phrase.io** — gestion des traductions externes (import/export CSV, webhook)
- **GitHub** (`@octokit/rest`) — probablement pour l'automatisation des releases
- **Slack** — notifications via webhook
