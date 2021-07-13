const { expect, domainBuilder, airtableBuilder, sinon } = require('../../../../test-helper');
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const airtable = require('../../../../../lib/infrastructure/airtable');
const airtableClient = require('airtable');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | ChallengeDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Challenge from the AirtableRecord', () => {
      // given
      const expectedChallenge = domainBuilder.buildChallenge();
      const airtableChallenge = airtableBuilder.factory.buildChallenge(expectedChallenge);
      const challengeRecord = new AirtableRecord('Epreuves', airtableChallenge.id, airtableChallenge);

      // when
      const challenge = challengeDatasource.fromAirTableObject(challengeRecord);

      // then
      expect(challenge).to.deep.equal(expectedChallenge);
    });

    it('should deal with a missing timer', () => {
      // given
      const expectedChallenge = domainBuilder.buildChallenge();
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
      const expectedChallenge = domainBuilder.buildChallenge();
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
      const airtableChallenge = airtableBuilder.factory.buildChallenge({ t1Status: true, t2Status: false, t3Status: true });
      const challengeRecord = new AirtableRecord('Epreuves', airtableChallenge.id, airtableChallenge);

      // when
      const challenge = challengeDatasource.fromAirTableObject(challengeRecord);

      // then
      expect(challenge.t1Status).to.be.true;
      expect(challenge.t2Status).to.be.false;
      expect(challenge.t3Status).to.be.true;
    });
  });

  describe('#toAirTableObject', () => {

    function _removeReadonlyFields(airtableChallenge) {
      delete airtableChallenge.id;
      delete airtableChallenge.fields.Preview;
      delete airtableChallenge.fields['Record ID'];
      delete airtableChallenge.fields['Compétences (via tube) (id persistant)'];
      delete airtableChallenge.fields['Acquix (id persistant)'];
      delete airtableChallenge.fields['Scoring'];
    }

    it('should serialize a challenge to an airtable object', () => {
      // given
      const createdChallenge = domainBuilder.buildChallenge({ locales: ['fr-fr'] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge(createdChallenge);
      _removeReadonlyFields(airtableChallenge);

      // when
      const challenge = challengeDatasource.toAirTableObject(createdChallenge);

      // then
      expect(challenge).to.deep.equal(airtableChallenge);
    });

    it('should transform boolean to `activer/désactiver` for t1, t2 and t3',() => {
      // given
      const createdChallenge = domainBuilder.buildChallenge({ t1Status: true, t2Status: false, t3Status: null });

      // when
      const challenge = challengeDatasource.toAirTableObject(createdChallenge);

      // then
      expect(challenge.fields['T1 - Espaces, casse & accents']).to.equal('Activé');
      expect(challenge.fields['T2 - Ponctuation']).to.equal('Désactivé');
      expect(challenge.fields['T3 - Distance d\'édition']).to.equal('Désactivé');
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
      const challengeRecord = new airtableClient.Record('Epreuves', challenge.id, challenge);

      sinon.stub(airtable, 'findRecords')
        .withArgs('Epreuves', { filterByFormula: '{id persistant} = \'recChallenge\'', maxRecords: 1 })
        .resolves([challengeRecord]);

      const newChallenge = await challengeDatasource.filterById('recChallenge');

      expect(newChallenge.id).to.equal('recChallenge');
    });
  });
});
