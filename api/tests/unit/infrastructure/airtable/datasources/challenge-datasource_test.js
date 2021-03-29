const { expect, airtableBuilder, sinon } = require('../../../../test-helper');
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const challengeAirtableDataObjectFixture = require('../../../../tooling/fixtures/infrastructure/challengeAirtableDataObjectFixture');
const challengeRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/challengeRawAirTableFixture');
const airtable = require('../../../../../lib/infrastructure/airtable');
const airtableClient = require('airtable');

describe('Unit | Infrastructure | Datasource | Airtable | ChallengeDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Challenge from the AirtableRecord', () => {
      // given
      const expectedChallenge = challengeAirtableDataObjectFixture();

      // when
      const challenge = challengeDatasource.fromAirTableObject(challengeRawAirTableFixture());

      // then
      expect(challenge).to.deep.equal(expectedChallenge);
    });

    it('should deal with a missing illustration', () => {
      // given
      const airtableEpreuveObject = challengeRawAirTableFixture();
      airtableEpreuveObject.set('Illustration de la consigne', undefined);

      // when
      const challenge = challengeDatasource.fromAirTableObject(airtableEpreuveObject);

      // then
      expect(challenge.illustrationUrl).to.be.undefined;
    });

    it('should deal with a missing timer', () => {
      // given
      const airtableEpreuveObject = challengeRawAirTableFixture();
      airtableEpreuveObject.set('Timer', undefined);

      // when
      const challenge = challengeDatasource.fromAirTableObject(airtableEpreuveObject);

      // then
      expect(challenge.timer).to.be.undefined;
    });

    it('should deal with a missing competences', () => {
      // given
      const airtableEpreuveObject = challengeRawAirTableFixture();
      airtableEpreuveObject.set('competences', undefined);
      airtableEpreuveObject.set('Compétences (via tube) (id persistant)', undefined);

      // when
      const challenge = challengeDatasource.fromAirTableObject(airtableEpreuveObject);

      // then
      expect(challenge.competenceId).to.be.undefined;
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
