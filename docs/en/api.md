# API

## Stack

Built with **Hapi.js** on Node.js, **PostgreSQL** as the database (via Knex for migrations, queries), and **Bull/Redis** for background job queues.

## Architecture

Follows a clean layered pattern:
- **`lib/application/`** — route handlers and Joi validation
- **`lib/domain/`** — use cases, models, domain services
- **`lib/infrastructure/`** — repositories (data access), JSON:API serializers, plugins

## Domain

The core content model maps the Pix pedagogical framework:

**Framework hierarchy**: Framework → Area → Competence → Thematic → Tube → Skill → Challenge

Other entities: `LocalizedChallenge` (locale variants), `Tutorial`, `Tag`, `Module`/`DraftModule`, `Mission`, `Attachment`, `Release`, `Note`, `Translation`.

## Key Endpoints

| Group | Paths |
|---|---|
| Framework content | `/api/areas`, `/api/competences`, `/api/skills`, `/api/challenges`, `/api/tubes`, `/api/thematics` |
| Modules | `/api/modules`, `/api/draft-modules`, `/api/module-summaries` |
| Missions | `/api/missions` |
| Localization | `/api/translations.csv`, `/api/localized-challenges` |
| Releases | `/api/releases`, `/api/current-content`, `/api/replication-data` |
| Admin | `/api/admin` |
| Misc | `/api/search`, `/api/attachments`, `/api/healthcheck` |

## Authentication

Custom Hapi auth scheme with token-based API keys. Most routes require a write-access check via `securityPreHandlers.checkUserHasWriteAccess`.

## Background Jobs (Bull/Redis)

- `release-job` — creates versioned content snapshots
- `upload-translation-job` — syncs translations to the Phrase.com translation service
- `check-urls-job` — validates the availability of external URLs
- `export-external-url-list-job` — exports to Google Sheets

- `release-table-cleaning-and-retention-job` — deletion of old versioned snapshots

## Notable Integrations

- **Phrase.** — external translation management (import/export CSV, webhook)
- **Slack** — webhook notifications
