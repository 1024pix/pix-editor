import { DatabaseBuilder } from '../../tests/tooling/database-builder/database-builder.js';
import { seedsConfig as learningContentConfig } from '../../lib/config.js';
import { brokenUrlsBuilder } from './data/broken-urls.js';
import { buildAreasFromConfig } from './data/areas.js';
import { buildChallengesFromConfig } from './data/challenges.js';
import { buildCompetencesFromConfig } from './data/competences.js';
import { buildFrameworksFromConfig } from './data/frameworks.js';
import { buildPix1D } from './data/pix-1d.js';
import { buildSkillsFromConfig } from './data/skills.js';
import { buildThematicsFromConfig } from './data/thematics.js';
import { buildTubesFromConfig } from './data/tubes.js';
import { buildLocalizedFrameworkTubesFromConfig } from './data/localized-framework-tubes.js';
import { staticCoursesBuilder } from './data/static-courses.js';
import { whitelistedUrlsBuilder } from './data/whitelisted-urls.js';
import { buildTags } from './data/tags.js';
import { buildTutorials } from './data/tutorials.js';
import { buildModules } from './data/modules.js';
import { externalUrlBuilder } from './data/external-urls.js';
import { draftModuleRepository } from '../../lib/infrastructure/repositories/index.js';
import { validateDraftModule } from '../../lib/domain/usecases/index.js';

export async function seed(knex) {
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

  const learningContentData = buildFrameworksFromConfig({ databaseBuilder, learningContentConfig });
  buildAreasFromConfig({ databaseBuilder, learningContentConfig, learningContentData });
  buildCompetencesFromConfig({ databaseBuilder, learningContentConfig, learningContentData });
  buildThematicsFromConfig({ databaseBuilder, learningContentConfig, learningContentData });
  buildTubesFromConfig({ databaseBuilder, learningContentConfig, learningContentData });
  buildLocalizedFrameworkTubesFromConfig({ databaseBuilder, learningContentConfig, learningContentData });
  const tagItems = buildTags({ databaseBuilder });
  const tutorialItems = buildTutorials({ databaseBuilder, locales: learningContentConfig.locales, tagItems });
  buildSkillsFromConfig({ databaseBuilder, learningContentConfig, learningContentData, tutorialItems });
  buildChallengesFromConfig({ databaseBuilder, learningContentConfig, learningContentData });
  buildPix1D({
    databaseBuilder,
    locales: learningContentConfig.locales,
    indexFramework: learningContentConfig.cntFrameworks,
  });

  staticCoursesBuilder(databaseBuilder);
  whitelistedUrlsBuilder(databaseBuilder, adminId);
  externalUrlBuilder(databaseBuilder);
  brokenUrlsBuilder(databaseBuilder);

  const draftModuleIds = buildModules(databaseBuilder);

  await databaseBuilder.commit();

  for (const id of draftModuleIds) {
    const draftModule = await draftModuleRepository.getById({ id });
    await validateDraftModule(draftModule);
  }
}

const adminUserApiKey = !process.env.REVIEW_APP && '8d03a893-3967-4501-9dc4-e0aa6c6dc442';
const defaultEditorUserApiKey = !process.env.REVIEW_APP && 'adaf3eee-09dc-4f9a-a504-ff92e74c9d0f';
const readPixOnlyUserApiKey = !process.env.REVIEW_APP && '09ae36c4-11e1-4212-ae51-e5719d142f57';
const readOnlyUserApiKey = !process.env.REVIEW_APP && '3b234506-e31e-45eb-a56e-17f64f31ca1b';
