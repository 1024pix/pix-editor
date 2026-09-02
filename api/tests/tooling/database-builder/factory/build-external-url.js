import { databaseBuffer } from '../database-buffer.js';

export function buildChallengeExternalUrl({
  framework_name = 'Pix',
  competence_name = 'Mon nom de compétence et puis les gens voilà quoi',
  skill_name = '@patateDouce',
  challenge_id = 'recMonChallenge',
  challenge_status = '<votre_statut_ici>',
  locale = 'nl',
  url = 'http://ui.pix.fr',
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'challenge_external_urls',
    autoId: true,
    values: {
      framework_name,
      competence_name,
      skill_name,
      challenge_id,
      challenge_status,
      locale,
      url,
    },
  });
}

export function buildTutorialExternalUrl({
  competence_name = 'Mon nom de compétence et puis les gens voilà quoi',
  skill_name = '@patateDouce',
  tutorial_id = 'recMonTuto',
  url = 'http://ui.pix.fr',
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'tutorial_external_urls',
    autoId: true,
    values: {
      competence_name,
      skill_name,
      tutorial_id,
      url,
    },
  });
}

export function buildExternalUrl({
  id = databaseBuffer.getNextId(),
  url = 'https://knexjs.org',
  localizedChallengeIds = ['recMonChallenge'],
  tutorialIds = ['recMonTuto'],
} = {}) {
  const externalUrl = databaseBuffer.pushInsertable({
    tableName: 'external_urls',
    values: {
      id,
      url,
    },
  });
  localizedChallengeIds?.forEach((localizedChallengeId) => {
    databaseBuffer.pushInsertable({
      tableName: 'external_urls-localized_challenges',
      values: {
        externalUrlId: externalUrl.id,
        localizedChallengeId,
      },
    });
  });
  tutorialIds?.forEach((tutorialId) => {
    databaseBuffer.pushInsertable({
      tableName: 'external_urls-tutorials',
      values: {
        externalUrlId: externalUrl.id,
        tutorialId,
      },
    });
  });
  return externalUrl;
}
