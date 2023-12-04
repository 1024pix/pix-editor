import { beforeEach, describe, expect, it } from 'vitest';
import {
  generateAuthorizationHeader,
  databaseBuilder,
  airtableBuilder,
  domainBuilder
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

const {
  buildArea,
  buildCompetence,
  buildTube,
  buildSkill,
  buildChallenge,
  buildTutorial,
  buildAttachment,
  buildThematic,
} = airtableBuilder.factory;

async function mockCurrentContent() {
  const expectedCurrentContent = {
    attachments: [domainBuilder.buildAttachment()],
    areas: [domainBuilder.buildAreaDatasourceObject()],
    competences: [domainBuilder.buildCompetenceForRelease({
      name_i18n: {
        fr: 'Français',
        en: 'English',
      },
      description_i18n: {
        fr: 'Description française',
        en: 'Description anglaise',
      }
    })],
    tubes: [domainBuilder.buildTubeDatasourceObject()],
    skills: [domainBuilder.buildSkillDatasourceObject()],
    challenges: [domainBuilder.buildChallenge()],
    tutorials: [domainBuilder.buildTutorialDatasourceObject()],
    thematics: [domainBuilder.buildThematicDatasourceObject()],
    courses: [{
      id: 'recCourse1',
      name: 'nameCourse1',
    },
    {
      id: 'recCourse2',
      name: 'nameCourse2',
    }],
  };

  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
    skills: [buildSkill(expectedCurrentContent.skills[0])],
    challenges: [buildChallenge(expectedCurrentContent.challenges[0])],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
    thematics: [buildThematic(expectedCurrentContent.thematics[0])],
    attachments: [buildAttachment(expectedCurrentContent.attachments[0])],
  });

  databaseBuilder.factory.buildStaticCourse({
    id: 'recCourse2',
    name: 'nameCourse2',
    description: 'Description du Course',
    challengeIds: 'recChallenge0',
  });

  databaseBuilder.factory.buildStaticCourse({
    id: 'recCourse1',
    name: 'nameCourse1',
    description: 'Description du Course',
    challengeIds: 'recChallenge0',
  });

  databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.name`,
    locale: 'fr',
    value: expectedCurrentContent.competences[0].name_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.name`,
    locale: 'en',
    value: expectedCurrentContent.competences[0].name_i18n.en,
  });
  databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.description`,
    locale: 'fr',
    value: expectedCurrentContent.competences[0].description_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.description`,
    locale: 'en',
    value: expectedCurrentContent.competences[0].description_i18n.en,
  });
  databaseBuilder.factory.buildTranslation({
    key: `skill.${expectedCurrentContent.skills[0].id}.hint`,
    locale: 'fr',
    value: expectedCurrentContent.skills[0].hint_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `skill.${expectedCurrentContent.skills[0].id}.hint`,
    locale: 'en',
    value: expectedCurrentContent.skills[0].hint_i18n.en,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.instruction`,
    locale: 'fr',
    value: expectedCurrentContent.challenges[0].translations.fr.instruction,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.alternativeInstruction`,
    locale: 'fr',
    value: expectedCurrentContent.challenges[0].translations.fr.alternativeInstruction,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.proposals`,
    locale: 'fr',
    value: expectedCurrentContent.challenges[0].translations.fr.proposals,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.solution`,
    locale: 'fr',
    value: expectedCurrentContent.challenges[0].translations.fr.solution,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.solutionToDisplay`,
    locale: 'fr',
    value: expectedCurrentContent.challenges[0].translations.fr.solutionToDisplay,
  });

  await databaseBuilder.commit();

  return expectedCurrentContent;
}

describe('Acceptance | Controller | replication-data-controller', () => {

  let user;

  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /api/replication-data', function() {
    it('should return data for replication', async function() {
      const expectedCurrentContent = await mockCurrentContent();

      const server = await createServer();
      const currentContentOptions = {
        method: 'GET',
        url: '/api/replication-data',
        headers: generateAuthorizationHeader(user),
      };

      // when
      const response = await server.inject(currentContentOptions);

      // then
      expect(JSON.parse(response.result)).to.deep.equal(expectedCurrentContent);
    });
  });
});
