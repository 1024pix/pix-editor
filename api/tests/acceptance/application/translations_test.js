import { afterEach, describe, expect, it } from 'vitest';
import FormData from 'form-data';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper';
import { createServer } from '../../../server';

describe('Acceptance | Controller | translations-controller', () => {

  describe('GET /translations.csv - export only translations of core framework in CSV file', () => {

    it('should return a csv file', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      const releaseContent = {
        frameworks: [{
          id: 'recFramework0',
          name: 'Pix'
        }, {
          id: 'recFramework1',
          name: 'Pix+'
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
          color: 'jaffa',
          frameworkId: 'recFramework0',
        },
        {
          id: 'recArea1',
          name: 'Nom du Domaine pix+',
          code: '1',
          title_i18n: {
            fr: 'Titre du Domaine - fr',
            en: 'Titre du Domaine - en',
          },
          competenceIds: ['recCompetence1'],
          color: 'jaffa',
          frameworkId: 'recFramework1',
        }],
        competences: [{
          id: 'recCompetence0',
          index: '1.1',
          name_i18n: {
            fr: 'Nom de la Compétence - fr',
            en: 'Nom de la Compétence - en',
          },
          areaId: 'recArea0',
          origin: 'Pix',
          skillIds: ['recSkill0'],
          thematicIds: ['recThematic0'],
          description_i18n: {
            fr: 'Description de la compétence - fr',
            en: 'Description de la compétence - en',
          }
        },
        {
          id: 'recCompetence1',
          index: '1.1',
          name_i18n: {
            fr: 'Nom de la Compétence - fr',
            en: 'Nom de la Compétence - en',
          },
          areaId: 'recArea1',
          origin: 'Pix+',
          skillIds: [],
          thematicIds: [],
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
          name: '@acquis',
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
          name: '@acquis1',
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
          instruction: 'Consigne du Challenge',
          proposals: 'Propositions du Challenge',
          type: 'Type d\'épreuve',
          solution: 'Bonnes réponses du Challenge',
          solutionToDisplay: 'Bonnes réponses du Challenge à afficher',
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
          locales: ['fr'],
          alternativeInstruction: 'Consigne alternative',
          focusable: false,
          delta: 0.5,
          alpha: 0.9,
          responsive: ['Smartphone'],
          genealogy: 'Prototype 1',
        }],
      };
      databaseBuilder.factory.buildRelease({
        content: releaseContent
      });

      await databaseBuilder.commit();

      const server = await createServer();
      const getTranslationsOptions = {
        method: 'GET',
        url: '/api/translations.csv',
        headers: generateAuthorizationHeader(user)
      };

      // When
      const response = await server.inject(getTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equal('text/csv; charset=utf-8');
      const [headers, ...payload] = response.payload.split('\n');
      payload.sort();
      expect(headers).to.equal('key,fr,tags');
      expect(payload).to.deep.equal([
        'challenge.recChallenge0.alternativeInstruction,Consigne alternative,"epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix"',
        'challenge.recChallenge0.instruction,Consigne du Challenge,"epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix"',
        'challenge.recChallenge0.proposals,Propositions du Challenge,"epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix"',
        'challenge.recChallenge0.solution,Bonnes réponses du Challenge,"epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix"',
        'challenge.recChallenge0.solutionToDisplay,Bonnes réponses du Challenge à afficher,"epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix"',
        'competence.recCompetence0.description,Description de la compétence - fr,"competence,Pix-1-1.1,Pix-1,Pix"',
        'competence.recCompetence0.name,Nom de la Compétence - fr,"competence,Pix-1-1.1,Pix-1,Pix"',
      ]);
    });

    it('should still export csv file even when a challenge has no skill' , async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      const releaseContent = {
        frameworks: [{
          id: 'recFramework0',
          name: 'Pix'
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
          areaId: 'recArea0',
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
          name: '@acquis',
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
          name: '@acquis1',
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
          instruction: 'Consigne du Challenge',
          proposals: 'Propositions du Challenge',
          type: 'Type d\'épreuve',
          solution: 'Bonnes réponses du Challenge',
          solutionToDisplay: 'Bonnes réponses du Challenge à afficher',
          t1Status: false,
          t2Status: true,
          t3Status: false,
          status: 'validé',
          skillId: 'inconnu',
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
          locales: ['fr'],
          alternativeInstruction: 'Consigne alternative',
          focusable: false,
          delta: 0.5,
          alpha: 0.9,
          responsive: ['Smartphone'],
          genealogy: 'Prototype 1',
        }],
      };
      databaseBuilder.factory.buildRelease({
        content: releaseContent
      });

      await databaseBuilder.commit();

      const server = await createServer();
      const getTranslationsOptions = {
        method: 'GET',
        url: '/api/translations.csv',
        headers: generateAuthorizationHeader(user)
      };

      // When
      const response = await server.inject(getTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equal('text/csv; charset=utf-8');
      const [headers, ...payload] = response.payload.split('\n');
      payload.sort();
      expect(headers).to.equal('key,fr,tags');
      expect(payload).to.deep.equal([
        'competence.recCompetence0.description,Description de la compétence - fr,"competence,Pix-1-1.1,Pix-1,Pix"',
        'competence.recCompetence0.name,Nom de la Compétence - fr,"competence,Pix-1-1.1,Pix-1,Pix"',
      ]);
    });

    describe('when an error occurs during streaming', () => {
      it('should manage unexpected errors' , async () => {
        // Given
        const user = databaseBuilder.factory.buildAdminUser();
        const releaseContent = {
          skills: [{
            id: 'recSkill0',
            name: '@acquis1',
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
            instruction: 'Consigne du Challenge',
            proposals: 'Propositions du Challenge',
            type: 'Type d\'épreuve',
            solution: 'Bonnes réponses du Challenge',
            solutionToDisplay: 'Bonnes réponses du Challenge à afficher',
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
            locales: ['fr'],
            alternativeInstruction: 'Consigne alternative',
            focusable: false,
            delta: 0.5,
            alpha: 0.9,
            responsive: ['Smartphone'],
            genealogy: 'Prototype 1',
          }],
        };
        databaseBuilder.factory.buildRelease({
          content: releaseContent
        });

        await databaseBuilder.commit();

        const server = await createServer();
        const getTranslationsOptions = {
          method: 'GET',
          url: '/api/translations.csv',
          headers: generateAuthorizationHeader(user)
        };

        // When
        const response = server.inject(getTranslationsOptions);

        // Then
        await expect(response).rejects.toHaveProperty('isBoom', true);
      });
    });
  });

  describe('PATCH /translations.csv - import translations from a CSV file', () => {

    afterEach(async() => {
      await knex('translations').delete();
    });

    it('should update the translations', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeId.some-key',
        locale: 'fr',
        value: 'La clé !'
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeId',
        challengeId: 'challengeId',
        locale: 'fr',
      });

      await databaseBuilder.commit();
      const formData = new FormData();
      formData.append('file', 'key_name,nl,comment\nchallenge.challengeId.some-key,plop,commentaire\nchallenge.challengeId.key,blip,', 'test.csv');

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(204);
      await expect(knex('translations').count()).resolves.to.deep.equal([{ count: 3 }]);
      await expect(knex('translations')
        .where({ key: 'challenge.challengeId.some-key' })
        .select('locale', 'value')
        .orderBy('locale'))
        .resolves.to.deep.equal([{ locale: 'fr', value: 'La clé !' },{ locale: 'nl', value: 'plop' }]);
      await expect(knex('translations')
        .where({ key: 'challenge.challengeId.key' })
        .select('locale', 'value')
        .first())
        .resolves.to.deep.equal({ locale: 'nl', value: 'blip' });
      await expect(knex('localized_challenges').count()).resolves.to.deep.equal([{ count: 2 }]);
      await expect(knex('localized_challenges')
        .where({ locale: 'nl' })
        .select(['challengeId', 'locale'])
        .first())
        .resolves.to.deep.equal({ challengeId: 'challengeId', locale: 'nl' });
    });

    it('should fail when the file is not a CSV', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildTranslation({
        key: 'some-key',
        locale: 'fr-fr',
        value: 'La clé !'
      });
      await databaseBuilder.commit();
      const formData = new FormData();
      formData.append('file', 'Helloworld', 'test.json');

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(400);
    });

    it('should fail when there are more than one file', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildTranslation({
        key: 'some-key',
        locale: 'fr-fr',
        value: 'La clé !'
      });
      await databaseBuilder.commit();
      const formData = new FormData();
      formData.append('file', 'key,locale,value\nsome-key,fr-fr,plop', 'test1.csv');
      formData.append('file', 'key,locale,value\nsome-key2,fr-fr,plop again', 'test2.csv');

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 4xx when there is no file', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const formData = new FormData();

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(400);
    });

    it('should not import parts with a name different than file', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const formData = new FormData();
      formData.append('file', 'key_name,fr-fr\nsome-key,plop', 'test.csv');
      formData.append('not-file', 'key_name,fr-fr\nsome-other-key,plop', 'test.csv');

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(204);

      expect(await knex('translations').count()).to.deep.equal([{ count: 1 }]);
      expect(await knex('translations').where({ key: 'some-key' }).select('value').first()).to.deep.equal({ value: 'plop' });
    });

  });
});
