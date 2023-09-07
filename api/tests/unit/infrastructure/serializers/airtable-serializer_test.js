const { expect, domainBuilder, airtableBuilder } = require('../../../test-helper');
const airtableSerializer = require('../../../../lib/infrastructure/serializers/airtable-serializer');

describe('Unit | Infrastructure | Serializers | Airtable Serializer', () => {
  describe('#serialize', () => {

    it('should create a Area from the AirtableRecord', () => {
      // given
      const expectedArea = domainBuilder.buildAreaDatasourceObject();
      const airtableObject = airtableBuilder.factory.buildArea({
        id: 'recvoGdo7z2z7pXWa',
        competenceIds: [
          'recsvLz0W2ShyfD63',
          'recNv8qhaY887jQb2',
          'recIkYm646lrGvLNT',
        ],
        competenceAirtableIds: ['recChallenge0'],
        code: '1',
        name: '1. Information et données',
        title_i18n: {
          fr: 'Information et données',
          en: 'Information and data',
        },
        color: 'jaffa',
        frameworkId: 'recFramework0'
      });
      const tableName = 'Domaines';

      // when
      const { updatedRecord, model } = airtableSerializer.serialize({ airtableObject, tableName });

      // then
      expect(updatedRecord).to.deep.equal(expectedArea);
      expect(model).to.deep.equal('areas');
    });
  });
});
