import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';
import { airtableBuilder, databaseBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import axios from 'axios';
import { Area, Mission } from '../../../../lib/domain/models/index.js';
import { MissionForRelease } from '../../../../lib/domain/models/release/MissionForRelease.js';
import { ChallengeForRelease, SkillForRelease } from '../../../../lib/domain/models/release/index.js';

const {
  buildArea,
  buildAttachment,
  buildChallenge,
  buildCompetence,
  buildFramework,
  buildSkill,
  buildThematic,
  buildTube,
  buildTutorial,
} = airtableBuilder.factory;

async function mockCurrentContent() {
  const expectedCurrentContent = {
    frameworks: [{
      id: 'recFramework0',
      name: 'Nom du referentiel'
    }],
    areas: [{
      id: 'recArea0',
      name: '1. Titre du Domaine - fr',
      code: '1',
      title_i18n: {
        fr: 'Titre du Domaine - fr',
        en: 'Titre du Domaine - en',
        nl: 'Titre du Domaine - nl',
      },
      competenceIds: ['recCompetence0'],
      competenceAirtableIds: ['recCompetence123'],
      color: Area.COLORS.JAFFA,
      frameworkId: 'recFramework0',
    }],
    competences: [{
      id: 'recCompetence0',
      index: '1.1',
      name_i18n: {
        fr: 'Nom de la Compétence - fr',
        en: 'Nom de la Compétence - en',
        nl: 'Nom de la Compétence - nl',
      },
      areaId: '1',
      origin: 'Pix',
      skillIds: ['recSkill0'],
      thematicIds: ['recThematic0'],
      description_i18n: {
        fr: 'Description de la compétence - fr',
        en: 'Description de la compétence - en',
        nl: 'Nom de la Compétence - nl',
      }
    }],
    thematics: [{
      id: 'recThematic0',
      name_i18n: {
        fr: 'Nom',
        en: 'name',
        nl: 'name nl',
      },
      competenceId: 'recCompetence0',
      tubeIds: ['recTube0'],
      index: 0
    }],
    tubes: [{
      id: 'recTube0',
      name: 'Nom du Tube',
      practicalTitle_i18n: {
        fr: 'Titre pratique du Tube - fr',
        en: 'Titre pratique du Tube - en',
        nl: 'Titre pratique du Tube - nl',
      },
      practicalDescription_i18n: {
        fr: 'Description pratique du Tube - fr',
        en: 'Description pratique du Tube - en',
        nl: 'Description pratique du Tube - nl',
      },
      competenceId: 'recCompetence0',
      thematicId: 'recThematic0',
      skillIds: ['recSkill0'],
      isMobileCompliant: true,
      isTabletCompliant: false,
    }],
    skills: [{
      id: 'recSkill0',
      name: 'Nom de l‘Acquis',
      hint_i18n: {
        fr: 'Indice - fr',
        en: 'Indice - en',
        nl: 'Indice - nl',
      },
      hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
      tutorialIds: ['recTutorial0'],
      learningMoreTutorialIds: ['recTutorial1'],
      pixValue: 8,
      competenceId: 'recCompetence0',
      status: SkillForRelease.STATUSES.ACTIF,
      tubeId: 'recTube0',
      version: 1,
      level: 1,
    }],
    challenges: [{
      id: 'recChallenge0',
      instruction: 'Consigne du Challenge - fr-fr',
      proposals: 'Propositions du Challenge - fr-fr',
      type: ChallengeForRelease.TYPES.QCM,
      solution: 'Bonnes réponses du Challenge - fr-fr',
      solutionToDisplay: 'Bonnes réponses du Challenge à afficher - fr-fr',
      t1Status: false,
      t2Status: true,
      t3Status: false,
      status: ChallengeForRelease.STATUSES.VALIDE,
      skillId: 'recSkill0',
      embedUrl: 'Embed URL',
      embedTitle: 'Embed title',
      embedHeight: 'Embed height',
      timer: 12,
      illustrationUrl: 'url de l‘illustration',
      attachments: ['url de la pièce jointe'],
      competenceId: 'recCompetence0',
      illustrationAlt: 'Texte alternatif illustration',
      format: 'mots',
      autoReply: false,
      locales: ['fr-fr'],
      alternativeInstruction: 'Consigne alternative - fr-fr',
      focusable: false,
      delta: 0.5,
      alpha: 0.9,
      responsive: ['Smartphone'],
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
    }],
    tutorials: [{
      id: 'recTutorial0',
      duration: 'Durée du Tutoriel',
      format: 'Format du Tutoriel',
      link: 'Lien du Tutoriel',
      source: 'Source du Tutoriel',
      title: 'Titre du Tutoriel',
      locale: 'Langue du Tutoriel',
    }],
    courses: [{
      id: 'recCourse0',
      name: 'Nom du Course',
      description: 'Description du Course',
      isActive: true,
      challenges: ['recChallenge0'],
    }],
    missions: [new Mission({
      id: 1,
      name_i18n: { fr: 'Ma première mission' },
      competenceId: 'competenceId',
      thematicIds: 'thematicId,thematicId',
      learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
      validatedObjectives_i18n: { fr: 'Rien' },
      status: Mission.status.ACTIVE,
      createdAt: new Date('2010-01-04'),
    }), new Mission({
      id: 2,
      name_i18n: { fr: 'Alt name' },
      competenceId: 'competenceId',
      thematicIds: 'thematicId,thematicId',
      learningObjectives_i18n: { fr: 'Alt objectives' },
      validatedObjectives_i18n: { fr: 'Alt validated objectives' },
      status: Mission.status.INACTIVE,
      createdAt: new Date('2010-01-05'),
    })]
  };

  const attachments = [{
    id: 'attid1',
    url: 'url de l‘illustration',
    type: 'illustration',
    challengeId: 'recChallenge0',
    localizedChallengeId: 'recChallenge0',
  }, {
    id: 'attid2',
    url: 'url de la pièce jointe',
    type: 'attachment',
    challengeId: 'recChallenge0',
    localizedChallengeId: 'recChallenge0',
  }, {
    id: 'attid3',
    url: 'url of the joint piece',
    type: 'attachment',
    challengeId: 'recChallenge0',
    localizedChallengeId: 'recChallenge0En',
  }];

  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    attachments: attachments.map(buildAttachment),
    challenges: [buildChallenge({
      ...expectedCurrentContent.challenges[0],
      files: attachments.map(({ id: fileId, localizedChallengeId }) => ({ fileId, localizedChallengeId }))
    })],
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    frameworks: [buildFramework(expectedCurrentContent.frameworks[0])],
    skills: [buildSkill(expectedCurrentContent.skills[0])],
    thematics: expectedCurrentContent.thematics.map(buildThematic),
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
  });

  databaseBuilder.factory.buildStaticCourse({
    id: 'recCourse0',
    name: 'Nom du Course',
    description: 'Description du Course',
    isActive: true,
    challengeIds: 'recChallenge0',
  });

  databaseBuilder.factory.buildMission({
    id: 1,
    name: 'Ma première mission',
    competenceId: 'competenceId',
    thematicIds: 'thematicId,thematicId',
    learningObjectives: 'Que tu sois le meilleur',
    validatedObjectives: 'Rien',
    status: Mission.status.ACTIVE,
    createdAt: new Date('2010-01-04'),
  });
  databaseBuilder.factory.buildMission({
    id: 2,
    name: 'Alt name',
    competenceId: 'competenceId',
    thematicIds: 'thematicId,thematicId',
    learningObjectives: 'Alt objectives',
    validatedObjectives: 'Alt validated objectives',
    status: Mission.status.INACTIVE,
    createdAt: new Date('2010-01-05'),
  });

  for (const locale of ['fr', 'en', 'nl']) {
    databaseBuilder.factory.buildTranslation({
      key: `competence.${expectedCurrentContent.competences[0].id}.name`,
      locale,
      value: expectedCurrentContent.competences[0].name_i18n[locale],
    });
    databaseBuilder.factory.buildTranslation({
      key: `competence.${expectedCurrentContent.competences[0].id}.description`,
      locale,
      value: expectedCurrentContent.competences[0].description_i18n[locale],
    });

    databaseBuilder.factory.buildTranslation({
      key: `thematic.${expectedCurrentContent.thematics[0].id}.name`,
      locale,
      value: expectedCurrentContent.thematics[0].name_i18n[locale],
    });

    databaseBuilder.factory.buildTranslation({
      key: `skill.${expectedCurrentContent.skills[0].id}.hint`,
      locale,
      value: expectedCurrentContent.skills[0].hint_i18n[locale],
    });

    databaseBuilder.factory.buildTranslation({
      key: `area.${expectedCurrentContent.areas[0].id}.title`,
      locale,
      value: expectedCurrentContent.areas[0].title_i18n[locale],
    });

    databaseBuilder.factory.buildTranslation({
      key: `tube.${expectedCurrentContent.tubes[0].id}.practicalTitle`,
      locale,
      value: expectedCurrentContent.tubes[0].practicalTitle_i18n[locale],
    });
    databaseBuilder.factory.buildTranslation({
      key: `tube.${expectedCurrentContent.tubes[0].id}.practicalDescription`,
      locale,
      value: expectedCurrentContent.tubes[0].practicalDescription_i18n[locale],
    });
  }

  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.instruction`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].instruction,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.alternativeInstruction`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].alternativeInstruction,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.proposals`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].proposals,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.solution`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].solution,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.solutionToDisplay`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].solutionToDisplay,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.embedTitle`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].embedTitle,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.illustrationAlt`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].illustrationAlt,
  });

  databaseBuilder.factory.buildLocalizedChallenge({
    id: expectedCurrentContent.challenges[0].id,
    challengeId: expectedCurrentContent.challenges[0].id,
    locale: 'fr-fr',
    embedUrl: expectedCurrentContent.challenges[0].embedUrl,
  });

  await databaseBuilder.commit();

  return expectedCurrentContent;
}

async function mockContentForRelease() {
  const expectedCurrentContent = {
    frameworks: [{
      id: 'recFramework0',
      name: 'Nom du referentiel'
    }],
    areas: [{
      id: 'recArea0',
      name: '1. Titre du Domaine - fr',
      code: '1',
      competenceIds: ['recCompetence0'],
      competenceAirtableIds: ['recCompetence123'],
      color: Area.COLORS.JAFFA,
      frameworkId: 'recFramework0',
      title_i18n: {
        en: 'Titre du Domaine - en',
        fr: 'Titre du Domaine - fr',
        nl: 'Titre du Domaine - nl',
      },
    }],
    competences: [{
      id: 'recCompetence0',
      index: '1.1',
      areaId: '1',
      origin: 'Pix',
      skillIds: ['recSkill0'],
      thematicIds: ['recThematic0'],
      name_i18n: {
        en: 'Nom de la Compétence - en',
        fr: 'Nom de la Compétence - fr',
        nl: 'Nom de la Compétence - nl',
      },
      description_i18n: {
        en: 'Description de la compétence - en',
        fr: 'Description de la compétence - fr',
        nl: 'Description de la compétence - nl',
      },
    }],
    thematics: [{
      id: 'recThematic0',
      competenceId: 'recCompetence0',
      tubeIds: ['recTube0'],
      index: 0,
      name_i18n: {
        en: 'name',
        fr: 'Nom',
        nl: 'name nl',
      },
    }],
    tubes: [{
      id: 'recTube0',
      name: 'Nom du Tube',
      competenceId: 'recCompetence0',
      thematicId: 'recThematic0',
      skillIds: ['recSkill0'],
      isMobileCompliant: true,
      isTabletCompliant: false,
      practicalTitle_i18n: {
        en: 'Titre pratique du Tube - en',
        fr: 'Titre pratique du Tube - fr',
        nl: 'Titre pratique du Tube - nl',
      },
      practicalDescription_i18n: {
        en: 'Description pratique du Tube - en',
        fr: 'Description pratique du Tube - fr',
        nl: 'Description pratique du Tube - nl',
      },
    }],
    skills: [{
      id: 'recSkill0',
      name: 'Nom de l‘Acquis',
      hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
      tutorialIds: ['recTutorial0'],
      learningMoreTutorialIds: ['recTutorial1'],
      pixValue: 8,
      competenceId: 'recCompetence0',
      status: SkillForRelease.STATUSES.ACTIF,
      tubeId: 'recTube0',
      version: 1,
      level: 1,
      hint_i18n: {
        en: 'Indice - en',
        fr: 'Indice - fr',
        nl: 'Indice - nl',
      },
    }],
    challenges: [{
      id: 'recChallenge0',
      instruction: 'Consigne du Challenge - fr-fr',
      proposals: 'Propositions du Challenge - fr-fr',
      type: 'Type d\'épreuve',
      solution: 'Bonnes réponses du Challenge - fr-fr',
      solutionToDisplay: 'Bonnes réponses du Challenge à afficher - fr-fr',
      t1Status: false,
      t2Status: true,
      t3Status: false,
      status: ChallengeForRelease.STATUSES.VALIDE,
      skillId: 'recSkill0',
      embedUrl: 'Embed URL',
      embedTitle: 'Embed title',
      embedHeight: 'Embed height',
      timer: 12,
      competenceId: 'recCompetence0',
      format: 'mots',
      autoReply: false,
      locales: ['fr-fr'],
      alternativeInstruction: 'Consigne alternative - fr-fr',
      focusable: false,
      delta: 0.5,
      alpha: 0.9,
      responsive: ['Smartphone'],
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      attachments: ['url de la pièce jointe'],
      illustrationUrl: 'url de l‘illustration',
      illustrationAlt: 'Texte alternatif illustration',
    }],
    tutorials: [{
      id: 'recTutorial0',
      duration: 'Durée du Tutoriel',
      format: 'Format du Tutoriel',
      link: 'Lien du Tutoriel',
      source: 'Source du Tutoriel',
      title: 'Titre du Tutoriel',
      locale: 'Langue du Tutoriel',
    }],
    courses: [{
      id: 'recCourse0',
      name: 'Nom du Course',
      description: 'Description du Course',
      isActive: true,
      challenges: ['recChallenge0'],
    }],
    missions: [new MissionForRelease({
      id: 1,
      name_i18n: { fr: 'Ma première mission' },
      competenceId: 'competenceId',
      learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
      validatedObjectives_i18n: { fr: 'Rien' },
      status: Mission.status.ACTIVE,
      content: {
        dareChallenges: [],
        steps: []
      }
    }), new MissionForRelease({
      id: 2,
      name_i18n: { fr: 'Alt name' },
      competenceId: 'competenceId',
      learningObjectives_i18n: { fr: 'Alt objectives' },
      validatedObjectives_i18n: { fr: 'Alt validated objectives' },
      status: Mission.status.INACTIVE,
      content: {
        dareChallenges: [],
        steps: []
      }
    })],
  };

  const attachments = [{
    id: 'attid1',
    url: 'url de l‘illustration',
    type: 'illustration',
    challengeId: 'recChallenge0',
    localizedChallengeId: 'recChallenge0',
  }, {
    id: 'attid2',
    url: 'url de la pièce jointe',
    type: 'attachment',
    challengeId: 'recChallenge0',
    localizedChallengeId: 'recChallenge0',
  }, {
    id: 'attid3',
    url: 'url de la pièce jointe',
    type: 'attachment',
    challengeId: 'recChallenge0',
    localizedChallengeId: 'recChallenge0En',
  }];

  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    attachments: attachments.map(buildAttachment),
    challenges: [buildChallenge({
      ...expectedCurrentContent.challenges[0],
      files: attachments.map(({ id: fileId, localizedChallengeId }) => ({ fileId, localizedChallengeId }))
    })],
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    frameworks: [buildFramework(expectedCurrentContent.frameworks[0])],
    skills: [buildSkill(expectedCurrentContent.skills[0])],
    thematics: expectedCurrentContent.thematics.map(buildThematic),
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
  });

  databaseBuilder.factory.buildStaticCourse({
    id: 'recCourse0',
    name: 'Nom du Course',
    description: 'Description du Course',
    isActive: true,
    challengeIds: 'recChallenge0',
    imageUrl: 'Image du Course',
  });

  for (const locale of ['fr', 'en', 'nl']) {
    databaseBuilder.factory.buildTranslation({
      key: `competence.${expectedCurrentContent.competences[0].id}.name`,
      locale,
      value: expectedCurrentContent.competences[0].name_i18n[locale],
    });
    databaseBuilder.factory.buildTranslation({
      key: `competence.${expectedCurrentContent.competences[0].id}.description`,
      locale,
      value: expectedCurrentContent.competences[0].description_i18n[locale],
    });

    databaseBuilder.factory.buildTranslation({
      key: `thematic.${expectedCurrentContent.thematics[0].id}.name`,
      locale,
      value: expectedCurrentContent.thematics[0].name_i18n[locale],
    });

    databaseBuilder.factory.buildTranslation({
      key: `skill.${expectedCurrentContent.skills[0].id}.hint`,
      locale,
      value: expectedCurrentContent.skills[0].hint_i18n[locale],
    });

    databaseBuilder.factory.buildTranslation({
      key: `area.${expectedCurrentContent.areas[0].id}.title`,
      locale,
      value: expectedCurrentContent.areas[0].title_i18n[locale],
    });

    databaseBuilder.factory.buildTranslation({
      key: `tube.${expectedCurrentContent.tubes[0].id}.practicalTitle`,
      locale,
      value: expectedCurrentContent.tubes[0].practicalTitle_i18n[locale],
    });
    databaseBuilder.factory.buildTranslation({
      key: `tube.${expectedCurrentContent.tubes[0].id}.practicalDescription`,
      locale,
      value: expectedCurrentContent.tubes[0].practicalDescription_i18n[locale],
    });
  }

  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.instruction`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].instruction,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.alternativeInstruction`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].alternativeInstruction,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.proposals`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].proposals,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.solution`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].solution,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.solutionToDisplay`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].solutionToDisplay,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.embedTitle`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].embedTitle,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedCurrentContent.challenges[0].id}.illustrationAlt`,
    locale: 'fr-fr',
    value: expectedCurrentContent.challenges[0].illustrationAlt,
  });

  databaseBuilder.factory.buildLocalizedChallenge({
    id: expectedCurrentContent.challenges[0].id,
    challengeId: expectedCurrentContent.challenges[0].id,
    locale: 'fr-fr',
    embedUrl: expectedCurrentContent.challenges[0].embedUrl,
  });

  await databaseBuilder.commit();
  return expectedCurrentContent;
}

describe('Acceptance | Controller | release-controller', () => {

  describe('GET /current-content - Returns release from current Airtable data', () => {
    context('nominal case', () => {
      let user;
      beforeEach(async function() {
        user = databaseBuilder.factory.buildAdminUser();
        await databaseBuilder.commit();
      });

      it('should return current learning content', async () => {
        // Given
        const expectedCurrentContent = await mockCurrentContent();

        const server = await createServer();
        const currentContentOptions = {
          method: 'GET',
          url: '/api/current-content',
          headers: generateAuthorizationHeader(user),
        };

        // When
        const response = await server.inject(currentContentOptions);

        // Then
        expect(JSON.parse(response.result)).to.deep.equal(JSON.parse(JSON.stringify(expectedCurrentContent)));
      });

      it('should handle error', async () => {
        // Given
        airtableBuilder.mockList({ tableName: 'Domaines' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Competences' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Tubes' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Acquis' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Epreuves' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Tutoriels' }).returns().activate(500);

        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/current-content',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(() => JSON.parse(response.result)).to.throw(Error);
      });
    });
  });

  describe('GET /latest-release - Returns latest release', () => {
    context('nominal case', () => {
      let user;
      beforeEach(async function() {
        user = databaseBuilder.factory.buildAdminUser();
      });

      it('should return latest release of learning content', async () => {
        // Given
        const expectedLatestRelease = databaseBuilder.factory.buildRelease({
          content: {
            areas: [],
            challenges: [],
            competences: [],
            courses: [],
            frameworks: [],
            skills: [],
            thematics: [],
            tubes: [],
            tutorials: [],
            missions: [],
          }
        });
        const expectedContent = {
          areas: [],
          challenges: [],
          competences: [],
          courses: [],
          frameworks: [],
          skills: [],
          thematics: [],
          tubes: [],
          tutorials: [],
          missions: [],
        };
        await databaseBuilder.commit();

        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/releases/latest',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        const latestRelease = JSON.parse(response.result);
        expect(latestRelease.content).to.deep.equal(expectedContent);
        expect(latestRelease.id).to.deep.equal(expectedLatestRelease.id);
        expect(latestRelease.date).to.deep.equal(expectedLatestRelease.date);
      });
    });
  });

  describe('POST /releases - Creates the release', () => {

    beforeEach(function() {
      vi.spyOn(axios, 'post').mockResolvedValue();
    });

    afterEach(function() {
      return knex('releases').delete();
    });

    context('nominal case', () => {
      it('should create the release', async () => {
        // Given
        const user = databaseBuilder.factory.buildAdminUser();
        databaseBuilder.factory.buildMission({
          id: 1,
          name: 'Ma première mission',
          competenceId: 'competenceId',
          thematicIds: 'thematicId,thematicId',
          learningObjectives: 'Que tu sois le meilleur',
          validatedObjectives: 'Rien',
          status: Mission.status.ACTIVE,
        });
        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          competenceId: 'competenceId',
          thematicIds: 'thematicId,thematicId',
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          status: Mission.status.INACTIVE,
        });
        const server = await createServer();
        await databaseBuilder.commit();
        const expectedCurrentContent = await mockContentForRelease();

        nock('https://api.phrase.com')
          .get('/v2/projects/MY_PHRASE_PROJECT_ID/locales')
          .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
          .reply(200, [
            {
              id: 'frLocaleId',
              name: 'fr',
              code: 'fr',
              default: true,
            },
          ]);

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/releases',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const release = JSON.parse(response.result);
        expect(release.content).to.deep.equal(JSON.parse(JSON.stringify(expectedCurrentContent)));
      });
    });

    context('error case', async () => {
      it('should return a 403 when user is not allowed to create release', async () => {
        //given
        const user = databaseBuilder.factory.buildReadonlyUser();
        const server = await createServer();
        await databaseBuilder.commit();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/releases',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /releases/:id - Returns given release', () => {
    let user;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
    });

    context('nominal case', () => {
      it('should return release specified by id', async () => {
        // Given
        const expectedRelease = databaseBuilder.factory.buildRelease({
          id: 42,
          content: {
            areas: [],
            challenges: [],
            competences: [],
            courses: [],
            frameworks: [],
            skills: [],
            thematics: [],
            tubes: [],
            tutorials: []
          },
          createdAt: new Date('2021-01-01')
        });
        databaseBuilder.factory.buildRelease({
          id: 43,
          content: { some: 'other-release' },
          createdAt: new Date('2022-01-01')
        });

        const expectedContent = {
          areas: [],
          challenges: [],
          competences: [],
          courses: [],
          frameworks: [],
          skills: [],
          thematics: [],
          tubes: [],
          tutorials: [],
          missions: [],
        };

        await databaseBuilder.commit();

        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/releases/42',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const release = JSON.parse(response.result);
        expect(release.content).to.deep.equal(expectedContent);
        expect(release.id).to.deep.equal(expectedRelease.id);
        expect(release.date).to.deep.equal(expectedRelease.date);
      });
    });

    context('error case', () => {
      it('should return a 404 when the release does not exist', async () => {
        // Given
        await databaseBuilder.commit();
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/releases/42',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
