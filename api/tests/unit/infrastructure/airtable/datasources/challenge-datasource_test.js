const { expect } = require('../../../../test-helper');
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const challengeAirtableDataObjectFixture = require('../../../../tooling/fixtures/infrastructure/challengeAirtableDataObjectFixture');
const challengeRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/challengeRawAirTableFixture');

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

});
