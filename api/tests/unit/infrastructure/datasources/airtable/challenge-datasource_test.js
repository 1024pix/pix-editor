import { describe, expect, it, vi } from 'vitest';
import { domainBuilder, airtableBuilder } from '../../../../test-helper.js';
import { challengeDatasource } from '../../../../../lib/infrastructure/datasources/airtable/challenge-datasource.js';
import * as airtable from '../../../../../lib/infrastructure/airtable.js';
import airtableLib from 'airtable';

const { Record: AirtableRecord } = airtableLib;

describe('Unit | Infrastructure | Datasource | Airtable | ChallengeDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Challenge from the AirtableRecord', () => {
      // given
      const expectedChallenge = domainBuilder.buildChallengeDatasourceObject();
      const airtableChallenge = airtableBuilder.factory.buildChallenge(expectedChallenge);
      const challengeRecord = new AirtableRecord('Epreuves', airtableChallenge.id, airtableChallenge);

      // when
      const challenge = challengeDatasource.fromAirTableObject(challengeRecord);

      // then
      expect(challenge).to.deep.equal(expectedChallenge);
    });

    it('should deal with a missing timer', () => {
      // given
      const expectedChallenge = domainBuilder.buildChallengeDatasourceObject();
      expectedChallenge.timer = undefined;
      const airtableChallenge = airtableBuilder.factory.buildChallenge(expectedChallenge);
      const challengeRecord = new AirtableRecord('Epreuves', airtableChallenge.id, airtableChallenge);

      // when
      const challenge = challengeDatasource.fromAirTableObject(challengeRecord);

      // then
      expect(challenge.timer).to.be.undefined;
    });

    it('should deal with a missing competences', () => {
      // given
      const expectedChallenge = domainBuilder.buildChallengeDatasourceObject();
      expectedChallenge.competenceId = undefined;
      const airtableChallenge = airtableBuilder.factory.buildChallenge(expectedChallenge);
      const challengeRecord = new AirtableRecord('Epreuves', airtableChallenge.id, airtableChallenge);

      // when
      const challenge = challengeDatasource.fromAirTableObject(challengeRecord);

      // then
      expect(challenge.competenceId).to.be.undefined;
    });

    it('should convert Airtable t1, t2, t3 status to boolean', () => {
      // given
      const airtableChallenge = airtableBuilder.factory.buildChallenge({
        t1Status: true,
        t2Status: false,
        t3Status: true
      });
      const challengeRecord = new AirtableRecord('Epreuves', airtableChallenge.id, airtableChallenge);

      // when
      const challenge = challengeDatasource.fromAirTableObject(challengeRecord);

      // then
      expect(challenge.t1Status).to.be.true;
      expect(challenge.t2Status).to.be.false;
      expect(challenge.t3Status).to.be.true;
    });

    it('should convert language to locale', () => {
      // given
      const expectedLocales = ['de', 'en', 'es', 'it', 'fr', 'fr-fr', 'pt'];
      const languages = ['Allemand', 'Anglais', 'Espagnol', 'Italie', 'Francophone', 'Franco Français', 'Portugais'];
      const challengeRecord = new AirtableRecord('Epreuves', 1, {
        fields: {
          Langues: languages,
        },
      });

      // when
      const challenge = challengeDatasource.fromAirTableObject(challengeRecord);

      // then
      expect(challenge.locales).to.deep.equal(expectedLocales);
    });

    it('throw error when the language is unknown', () => {
      // given
      const languages = ['Belge'];
      const challengeRecord = new AirtableRecord('Epreuves', 1, {
        fields: {
          Langues: languages,
        },
      });

      // when
      const toThrow = () => {
        return challengeDatasource.fromAirTableObject(challengeRecord);
      };

      // then
      expect(toThrow).to.throw();
    });
  });

  describe('#toAirTableObject', () => {

    function _removeReadonlyFields(airtableChallenge) {
      delete airtableChallenge.fields.Preview;
      delete airtableChallenge.fields['Record ID'];
      delete airtableChallenge.fields['Compétences (via tube) (id persistant)'];
      delete airtableChallenge.fields['Acquix (id persistant)'];
      delete airtableChallenge.fields['Difficulté calculée'];
      delete airtableChallenge.fields['Discrimination calculée'];
      delete airtableChallenge.fields['updated_at'];
      delete airtableChallenge.fields['created_at'];
    }

    it('should serialize a challenge to an airtable object', () => {
      // given
      const createdChallenge = domainBuilder.buildChallengeDatasourceObject({ locales: ['fr-fr'] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge(createdChallenge);
      _removeReadonlyFields(airtableChallenge);

      // when
      const challenge = challengeDatasource.toAirTableObject(createdChallenge);

      // then
      expect(challenge).to.deep.equal(airtableChallenge);
    });

    it('should transform boolean to `activer/désactiver` for t1, t2 and t3', () => {
      // given
      const createdChallenge = domainBuilder.buildChallengeDatasourceObject({
        t1Status: true,
        t2Status: false,
        t3Status: null
      });

      // when
      const challenge = challengeDatasource.toAirTableObject(createdChallenge);

      // then
      expect(challenge.fields['T1 - Espaces, casse & accents']).to.equal('Activé');
      expect(challenge.fields['T2 - Ponctuation']).to.equal('Désactivé');
      expect(challenge.fields['T3 - Distance d\'édition']).to.equal('Désactivé');
    });

    it('should convert locale to language', () => {
      // given
      const locales = ['de', 'en', 'es', 'it', 'fr', 'fr-fr', 'pt'];

      const expectedLanguages = ['Allemand', 'Anglais', 'Espagnol', 'Italie', 'Francophone', 'Franco Français', 'Portugais'];
      const createdChallenge = domainBuilder.buildChallengeDatasourceObject({ locales });

      // when
      const challenge = challengeDatasource.toAirTableObject(createdChallenge);

      // then
      expect(challenge.fields.Langues).to.deep.equal(expectedLanguages);
    });

    it('throw an exception when an unexpected locale appear', () => {
      // given
      const locales = ['fr-be'];

      const createdChallenge = domainBuilder.buildChallengeDatasourceObject({ locales });

      // when
      const toThrow = function() {
        return challengeDatasource.toAirTableObject(createdChallenge);
      };

      // then
      expect(toThrow).to.throw();
    });
  });

  describe('#filterById', () => {
    it('calls airtable', async () => {
      const challenge = airtableBuilder.factory.buildChallenge({
        id: 'recChallenge',
        skillIds: [],
        skills: [],
        attachments: [],
      });
      const challengeRecord = new AirtableRecord('Epreuves', challenge.id, challenge);

      const airtableFindRecordsSpy = vi.spyOn(airtable, 'findRecords')
        .mockResolvedValue([challengeRecord]);

      const newChallenge = await challengeDatasource.filterById('recChallenge');

      expect(newChallenge.id).to.equal('recChallenge');
      expect(airtableFindRecordsSpy).toHaveBeenCalledWith('Epreuves', {
        filterByFormula: '{id persistant} = \'recChallenge\'',
        maxRecords: 1
      });
    });

    describe('when record is not found', () => {
      it('should return undefined', async () => {
        const airtableFindRecordsSpy = vi.spyOn(airtable, 'findRecords')
          .mockResolvedValue([]);

        const result = await challengeDatasource.filterById('recChallenge');

        expect(result).toBe(undefined);
        expect(airtableFindRecordsSpy).toHaveBeenCalledWith('Epreuves', {
          filterByFormula: '{id persistant} = \'recChallenge\'',
          maxRecords: 1
        });
      });
    });
  });

  describe('#search', () => {
    it('should search challenges with a query', async () => {
      const challenge = airtableBuilder.factory.buildChallenge({
        id: 'recChallenge',
        skillIds: [],
        skills: [],
        attachments: [],
      });
      const challengeRecord = new AirtableRecord('Epreuves', challenge.id, challenge);

      vi.spyOn(airtable, 'findRecords')
        .mockResolvedValue([challengeRecord]);

      challengeDatasource.usedFields = Symbol('used fields');
      const challenges = await challengeDatasource.search({
        filter: { search: 'query term', ids: [] },
      });

      expect(airtable.findRecords).toHaveBeenCalledWith('Epreuves', {
        fields: challengeDatasource.usedFields,
        filterByFormula: 'FIND(\'query term\', LOWER(CONCATENATE({Embed URL})))'
      });
      expect(challenges.length).to.equal(1);
      expect(challenges[0].id).to.equal('recChallenge');
    });

    it('should search challenges with a query or in ids', async () => {
      const challenge = airtableBuilder.factory.buildChallenge({
        id: 'recChallenge',
        skillIds: [],
        skills: [],
        attachments: [],
      });
      const challengeRecord = new AirtableRecord('Epreuves', challenge.id, challenge);

      vi.spyOn(airtable, 'findRecords')
        .mockResolvedValue([challengeRecord]);

      challengeDatasource.usedFields = Symbol('used fields');
      const challenges = await challengeDatasource.search({
        filter: { search: 'query term', ids: ['challengeId1'] },
      });

      expect(airtable.findRecords).toHaveBeenCalledWith('Epreuves', {
        fields: challengeDatasource.usedFields,
        filterByFormula: 'OR(FIND(\'query term\', LOWER(CONCATENATE({Embed URL}))), \'challengeId1\' = {id persistant})'
      });
      expect(challenges.length).to.equal(1);
      expect(challenges[0].id).to.equal('recChallenge');
    });

    it('should escape the query', async () => {
      vi.spyOn(airtable, 'findRecords')
        .mockResolvedValue([]);

      challengeDatasource.usedFields = Symbol('used fields');
      await challengeDatasource.search({ filter: { search: 'query \' term' } });

      expect(airtable.findRecords).toHaveBeenCalledWith('Epreuves', {
        fields: challengeDatasource.usedFields,
        filterByFormula: 'FIND(\'query \\\' term\', LOWER(CONCATENATE({Embed URL})))'
      });
    });
  });
});
