import { describe, expect, it } from 'vitest';
import { parseString as parseCSVString } from 'fast-csv';
import _ from 'lodash';
import { Buffer } from 'node:buffer';
import multipart  from 'parse-multipart-data';
import nock from 'nock';
import { databaseBuilder, generateAuthorizationHeader, knex, streamToPromiseArray } from '../../test-helper';
import { createServer } from '../../../server';

describe('Acceptance | Controller | phrase-controller', () => {

  describe('POST /phrase/upload', () => {

    it('should upload the translations to phrase', async () => {
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
          name: '1. Titre du Domaine - fr',
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
          name: '1. Titre du Domaine Pix+ - fr',
          code: '1',
          title_i18n: {
            fr: 'Titre du Domaine Pix+ - fr',
            en: 'Titre du Domaine Pix+ - en',
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

      databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'localizedChallengeId',
        locale: 'nl',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'recChallenge0',
        locale: 'fr',
      });

      await databaseBuilder.commit();

      const parseFormData = (body) => {
        const boundary = body.match(/.*/g)[0].slice(2);
        return multipart.parse(Buffer.from(body), boundary);
      };
      const findFormDataParameter = (parsedBody, name) => {
        return parsedBody.find((part) => part.name === name);
      };
      const matchFormDataParameter = (parsedBody, name, value) => {
        return findFormDataParameter(parsedBody, name).data.toString() === value;
      };

      let csvContent;

      const phraseAPIUpload = nock('https://api.phrase.com')
        .post('/v2/projects/MY_PHRASE_PROJECT_ID/uploads', (body) => {
          const parsedBody = parseFormData(body);
          csvContent = findFormDataParameter(parsedBody, 'file').data.toString();
          return matchFormDataParameter(parsedBody, 'locale_id', 'MY_PHRASE_LOCALE_ID') &&
            matchFormDataParameter(parsedBody, 'file_format', 'csv') &&
            matchFormDataParameter(parsedBody, 'update_descriptions', 'true') &&
            matchFormDataParameter(parsedBody, 'update_translations', 'true') &&
            matchFormDataParameter(parsedBody, 'skip_upload_tags', 'true') &&
            matchFormDataParameter(parsedBody, 'locale_mapping[fr]', '2') &&
            matchFormDataParameter(parsedBody, 'format_options[key_index]', '1') &&
            matchFormDataParameter(parsedBody, 'format_options[tag_column]', '3') &&
            matchFormDataParameter(parsedBody, 'format_options[comment_index]', '4') &&
            matchFormDataParameter(parsedBody, 'format_options[header_content_row]', 'true');
        })
        .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
        .reply(201, {});

      const server = await createServer();
      const postPhraseUploadOptions = {
        method: 'POST',
        url: '/api/phrase/upload',
        headers: {
          ...generateAuthorizationHeader(user),
          host: 'test.site',
        },
      };

      // When
      const response = await server.inject(postPhraseUploadOptions);

      // Then
      expect(response.statusCode).to.equal(204);
      expect(phraseAPIUpload.isDone()).to.be.true;

      const [headers, ...data] = await streamToPromiseArray(parseCSVString(csvContent));

      expect(headers).to.deep.equal(['key', 'fr', 'tags', 'description']);
      expect(_.orderBy(data, '0')).to.deep.equal([
        [
          'area.recArea0.title',
          'Titre du Domaine - fr',
          'domaine,Pix-1,Pix',
          ''
        ],
        [
          'challenge.recChallenge0.alternativeInstruction',
          'Consigne alternative',
          'epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix',
          'Prévisualisation FR: http://test.site/api/challenges/recChallenge0/preview\nPrévisualisation NL: http://test.site/api/challenges/recChallenge0/preview?locale=nl\nPix Editor: http://test.site/challenge/recChallenge0'
        ],
        [
          'challenge.recChallenge0.embedTitle',
          'Embed title',
          'epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix',
          'Prévisualisation FR: http://test.site/api/challenges/recChallenge0/preview\nPrévisualisation NL: http://test.site/api/challenges/recChallenge0/preview?locale=nl\nPix Editor: http://test.site/challenge/recChallenge0'
        ],
        [
          'challenge.recChallenge0.illustrationAlt',
          'Texte alternatif illustration',
          'epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix',
          'Prévisualisation FR: http://test.site/api/challenges/recChallenge0/preview\nPrévisualisation NL: http://test.site/api/challenges/recChallenge0/preview?locale=nl\nPix Editor: http://test.site/challenge/recChallenge0'
        ],
        [
          'challenge.recChallenge0.instruction',
          'Consigne du Challenge',
          'epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix',
          'Prévisualisation FR: http://test.site/api/challenges/recChallenge0/preview\nPrévisualisation NL: http://test.site/api/challenges/recChallenge0/preview?locale=nl\nPix Editor: http://test.site/challenge/recChallenge0'
        ],
        [
          'challenge.recChallenge0.proposals',
          'Propositions du Challenge',
          'epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix',
          'Prévisualisation FR: http://test.site/api/challenges/recChallenge0/preview\nPrévisualisation NL: http://test.site/api/challenges/recChallenge0/preview?locale=nl\nPix Editor: http://test.site/challenge/recChallenge0'
        ],
        [
          'challenge.recChallenge0.solution',
          'Bonnes réponses du Challenge',
          'epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix',
          'Prévisualisation FR: http://test.site/api/challenges/recChallenge0/preview\nPrévisualisation NL: http://test.site/api/challenges/recChallenge0/preview?locale=nl\nPix Editor: http://test.site/challenge/recChallenge0'
        ],
        [
          'challenge.recChallenge0.solutionToDisplay',
          'Bonnes réponses du Challenge à afficher',
          'epreuve,Pix-1-1.1-acquis-acquis1-valide,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix',
          'Prévisualisation FR: http://test.site/api/challenges/recChallenge0/preview\nPrévisualisation NL: http://test.site/api/challenges/recChallenge0/preview?locale=nl\nPix Editor: http://test.site/challenge/recChallenge0'
        ],
        [
          'competence.recCompetence0.description',
          'Description de la compétence - fr',
          'competence,Pix-1-1.1,Pix-1,Pix',
          ''
        ],
        [
          'competence.recCompetence0.name',
          'Nom de la Compétence - fr',
          'competence,Pix-1-1.1,Pix-1,Pix',
          ''
        ],
        [
          'skill.recSkill0.hint',
          'Indice - fr',
          'acquis,Pix-1-1.1-acquis-acquis1,Pix-1-1.1-acquis,Pix-1-1.1,Pix-1,Pix',
          ''
        ],
      ]);
    });
  });

  describe('POST /phrase/download', () => {
    it('should download the translations from phrase', async () => {
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();

      const phraseAPILocales = nock('https://api.phrase.com')
        .get('/v2/projects/MY_PHRASE_PROJECT_ID/locales')
        .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
        .reply(200, [
          {
            id: 'frLocaleId',
            name: 'fr',
            code: 'fr',
            default: true,
          },
          {
            id: 'enLocaleId',
            name: 'en',
            code: 'en',
            default: false,
          },
          {
            id: 'nlLocaleId',
            name: 'nl',
            code: 'nl',
            default: false,
          },
        ]);

      const phraseAPIDownloadEn = nock('https://api.phrase.com')
        .get('/v2/projects/MY_PHRASE_PROJECT_ID/locales/enLocaleId/download')
        .query({ file_format: 'csv' })
        .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
        .reply(200, 'key_name,en,comment', { 'Content-type': 'text/csv' });

      const phraseAPIDownloadNl = nock('https://api.phrase.com')
        .get('/v2/projects/MY_PHRASE_PROJECT_ID/locales/nlLocaleId/download')
        .query({ file_format: 'csv' })
        .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
        .reply(200, 'key_name,nl,comment\narea.recnrCmBiPXGbgIyQ.title,Environnement numérique,\nchallenge.challenge1nwE8BcKcmiNvR.instruction,"Quelle technologie sans fil est utilisée pour un kit mains-libres permettant de téléphoner en voiture ?\n","Prévisualisation FR: http://pix-lcms-review-pr556.osc-fr1.scalingo.io/api/challenges/challenge1nwE8BcKcmiNvR/preview, Pix Editor: http://pix-lcms-review-pr556.osc-fr1.scalingo.io/challenge/challenge1nwE8BcKcmiNvR"\n', { 'Content-type': 'text/csv' });

      const server = await createServer();
      const postPhraseDownloadOptions = {
        method: 'POST',
        url: '/api/phrase/download',
        headers: {
          ...generateAuthorizationHeader(user)
        },
      };

      // When
      const response = await server.inject(postPhraseDownloadOptions);

      // Then
      expect(response.statusCode).to.equal(204);
      expect(phraseAPILocales.isDone()).to.be.true;
      expect(phraseAPIDownloadEn.isDone()).to.be.true;
      expect(phraseAPIDownloadNl.isDone()).to.be.true;
      expect(knex('translations').select().orderBy('key')).resolves.to.deep.equal([
        { key: 'area.recnrCmBiPXGbgIyQ.title', locale: 'nl', value: 'Environnement numérique' },
        { key: 'challenge.challenge1nwE8BcKcmiNvR.instruction', locale: 'nl', value: 'Quelle technologie sans fil est utilisée pour un kit mains-libres permettant de téléphoner en voiture ?\n' },
      ]);
      expect(knex('localized_challenges').select().orderBy('id')).resolves.toEqual([{
        id: expect.stringMatching(/^challenge.*$/),
        challengeId: 'challenge1nwE8BcKcmiNvR',
        locale: 'nl',
        geography: null,
        embedUrl: null,
        status: 'proposé',
      }]);
    });
  });
});
