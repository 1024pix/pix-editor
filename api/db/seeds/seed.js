import { DatabaseBuilder } from '../../tests/tooling/database-builder/database-builder.js';
import { canSeedOrEmptyAirtableBase } from '../../lib/infrastructure/airtable.js';
import Airtable from 'airtable';
import { airtable, airtableSeedsConfig } from '../../lib/config.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { buildAreasFromConfig, copyAreasFromAirtable } from './data/areas.js';
import { buildChallengesFromConfig } from './data/challenges.js';
import { buildCompetencesFromConfig, copyCompetencesFromAirtable } from './data/competences.js';
import { buildFrameworksFromConfig, copyFrameworksFromAirtable } from './data/frameworks.js';
import { buildPix1D } from './data/pix-1d.js';
import { buildSkillsFromConfig } from './data/skills.js';
import { buildThematicsFromConfig, copyThematicsFromAirtable } from './data/thematics.js';
import { buildTubesFromConfig, copyTubesFromAirtable } from './data/tubes.js';
import { staticCoursesBuilder } from './data/static-courses.js';
import { whitelistedUrlsBuilder } from './data/whitelisted-urls.js';

import { localizedChallengesAttachmentsBuilder } from './data/localized-challenges-attachments.js';
import { localizedChallengesBuilder } from './data/localized-challenges.js';
import { translationsBuilder } from './data/translations.js';
import { buildMissions } from './data/missions.js';
import { buildTags, copyTutorialTagsFromAirtable } from './data/tags.js';
import { buildTutorials } from './data/tutorials.js';

export async function seed(knex) {
  const airtableClient = new Airtable({ apiKey: airtable.apiKey }).base(airtable.base);
  const databaseBuilder = new DatabaseBuilder({ knex });
  const adminId = databaseBuilder.factory.buildUser({
    trigram: 'DEV',
    name: 'Utilisateur pour le développement',
    access: 'admin',
    apiKey: process.env.REVIEW_APP_ADMIN_USER_API_KEY || adminUserApiKey,
  }).id;

  databaseBuilder.factory.buildUser({
    trigram: 'EDI',
    name: 'Editeur pour le développement',
    access: 'editor',
    apiKey: process.env.REVIEW_APP_EDITOR_USER_API_KEY || defaultEditorUserApiKey,
  });

  databaseBuilder.factory.buildUser({
    trigram: 'RPO',
    name: 'Lecteur pix pour le développement',
    access: 'readpixonly',
    apiKey: process.env.REVIEW_APP_READ_PIX_ONLY_USER_API_KEY || readPixOnlyUserApiKey,
  });

  databaseBuilder.factory.buildUser({
    trigram: 'LOL',
    name: 'Lecteur TOUT pour le développement',
    access: 'readonly',
    apiKey: process.env.REVIEW_APP_READ_ONLY_USER_API_KEY || readOnlyUserApiKey,
  });

  const canSeedAirtableBase = await canSeedOrEmptyAirtableBase();
  if (canSeedAirtableBase) {
    const learningContentConfig = {
      ...airtableSeedsConfig,
    };
    const learningContentData = await buildFrameworksFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig });
    await buildAreasFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData });
    await buildCompetencesFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData });
    await buildThematicsFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData });
    await buildTubesFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData });
    await buildSkillsFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData });
    await buildChallengesFromConfig({ airtableClient, databaseBuilder, logger, learningContentConfig, learningContentData });
    await buildPix1D({ airtableClient, databaseBuilder, logger, locales: learningContentConfig.locales, indexFramework: learningContentConfig.cntFrameworks });
    const tagItems = await buildTags({ airtableClient, logger, databaseBuilder });
    await buildTutorials({ airtableClient, logger, locales: learningContentConfig.locales, tagItems });
  } else {
    await copyFrameworksFromAirtable({ airtableClient, databaseBuilder, logger });
    await copyAreasFromAirtable({ airtableClient, databaseBuilder, logger });
    await copyCompetencesFromAirtable({ airtableClient, databaseBuilder, logger });
    await copyThematicsFromAirtable({ airtableClient, databaseBuilder, logger });
    await copyTubesFromAirtable({ airtableClient, databaseBuilder, logger });
    await copyTutorialTagsFromAirtable({ airtableClient, databaseBuilder, logger });

    const translations = await translationsBuilder(databaseBuilder);
    await localizedChallengesBuilder(databaseBuilder, translations);
    await localizedChallengesAttachmentsBuilder(databaseBuilder);
    buildMissions(databaseBuilder);
  }

  staticCoursesBuilder(databaseBuilder);
  whitelistedUrlsBuilder(databaseBuilder, adminId);
  return databaseBuilder.commit();
}

const adminUserApiKey = !process.env.REVIEW_APP && '8d03a893-3967-4501-9dc4-e0aa6c6dc442';
const defaultEditorUserApiKey = !process.env.REVIEW_APP && 'adaf3eee-09dc-4f9a-a504-ff92e74c9d0f';
const readPixOnlyUserApiKey = !process.env.REVIEW_APP && '09ae36c4-11e1-4212-ae51-e5719d142f57';
const readOnlyUserApiKey = !process.env.REVIEW_APP && '3b234506-e31e-45eb-a56e-17f64f31ca1b';
