import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import {
  airtableBuilder,
  databaseBuilder,
  generateAuthorizationHeader,
  knex
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import axios from 'axios';

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
      name: 'Nom du Domaine',
      code: '1',
      title_i18n: {
        fr: 'Titre du Domaine - fr',
        en: 'Titre du Domaine - en',
      },
      competenceIds: ['recCompetence0'],
      competenceAirtableIds: ['recCompetence123'],
      color: 'jaffa',
      frameworkId: 'recFramework0',
    }],
    competences: [{
      id: 'recCompetence0',
      index: '1.1',
      name_i18n: {
        fr: 'Nom de la Compétence - fr',
        en: 'Nom de la Compétence - en',
      },
      areaId: '1',
      origin: 'Pix',
      skillIds: ['recSkill0'],
      thematicIds: ['recThematic0'],
      description_i18n: {
        fr: 'Description de la compétence - fr',
        en: 'Description de la compétence - en',
      }
    }],
    thematics: [{
      id: 'recThematic0',
      name_i18n: {
        fr: 'Nom',
        en: 'name',
      },
      competenceId: 'recCompetence0',
      tubeIds: ['recTube0'],
      index: 0
    }],
    tubes: [{
      id: 'recTube0',
      name: 'Nom du Tube',
      title: 'Titre du Tube',
      description: 'Description du Tube',
      practicalTitle_i18n: {
        fr: 'Titre pratique du Tube - fr',
        en: 'Titre pratique du Tube - en',
      },
      practicalDescription_i18n: {
        fr: 'Description pratique du Tube - fr',
        en: 'Description pratique du Tube - en',
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
      },
      hintStatus: 'Statut de l‘indice',
      tutorialIds: ['recTutorial0'],
      learningMoreTutorialIds: ['recTutorial1'],
      pixValue: 8,
      competenceId: 'recCompetence0',
      status: 'validé',
      tubeId: 'recTube0',
      version: 1,
      level: 1,
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
      status: 'validé',
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
      genealogy: 'Prototype 1',
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
      competences: ['recCompetence0'],
      challenges: ['recChallenge0'],
    }],
  };

  const attachments = [{
    url: 'url de l‘illustration',
    alt: 'Texte alternatif illustration',
    type: 'illustration',
    challengeId: 'recChallenge0',
  }, {
    url: 'url de la pièce jointe',
    type: 'attachment',
    challengeId: 'recChallenge0',
  }];
  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    attachments: attachments.map(buildAttachment),
    challenges: [buildChallenge(expectedCurrentContent.challenges[0])],
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

  databaseBuilder.factory.buildLocalizedChallenge({
    id: expectedCurrentContent.challenges[0].id,
    challengeId: expectedCurrentContent.challenges[0].id,
    locale: 'fr-fr',
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
      name: 'Nom du Domaine',
      code: '1',
      competenceIds: ['recCompetence0'],
      competenceAirtableIds: ['recCompetence123'],
      color: 'jaffa',
      frameworkId: 'recFramework0',
      title_i18n: {
        en: 'Titre du Domaine - en',
        fr: 'Titre du Domaine - fr',
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
      },
      description_i18n: {
        en: 'Description de la compétence - en',
        fr: 'Description de la compétence - fr',
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
      },
    }],
    tubes: [{
      id: 'recTube0',
      name: 'Nom du Tube',
      title: 'Titre du Tube',
      description: 'Description du Tube',
      competenceId: 'recCompetence0',
      thematicId: 'recThematic0',
      skillIds: ['recSkill0'],
      isMobileCompliant: true,
      isTabletCompliant: false,
      practicalTitle_i18n: {
        en: 'Titre pratique du Tube - en',
        fr: 'Titre pratique du Tube - fr',
      },
      practicalDescription_i18n: {
        en: 'Description pratique du Tube - en',
        fr: 'Description pratique du Tube - fr',
      },
    }],
    skills: [{
      id: 'recSkill0',
      name: 'Nom de l‘Acquis',
      hintStatus: 'Statut de l‘indice',
      tutorialIds: ['recTutorial0'],
      learningMoreTutorialIds: ['recTutorial1'],
      pixValue: 8,
      competenceId: 'recCompetence0',
      status: 'validé',
      tubeId: 'recTube0',
      version: 1,
      level: 1,
      hint_i18n: {
        en: 'Indice - en',
        fr: 'Indice - fr',
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
      status: 'validé',
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
      genealogy: 'Prototype 1',
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
      competences: ['recCompetence0'],
      challenges: ['recChallenge0'],
    }],
  };

  const attachments = [{
    url: 'url de l‘illustration',
    alt: 'Texte alternatif illustration',
    type: 'illustration',
    challengeId: 'recChallenge0',
  }, {
    url: 'url de la pièce jointe',
    type: 'attachment',
    challengeId: 'recChallenge0',
  }];

  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    attachments: attachments.map(buildAttachment),
    challenges: [buildChallenge(expectedCurrentContent.challenges[0])],
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

  databaseBuilder.factory.buildLocalizedChallenge({
    id: expectedCurrentContent.challenges[0].id,
    challengeId: expectedCurrentContent.challenges[0].id,
    locale: 'fr-fr',
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
            tutorials: []
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
          tutorials: []
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
        const server = await createServer();
        await databaseBuilder.commit();
        const expectedCurrentContent = await mockContentForRelease();

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
          tutorials: []
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
