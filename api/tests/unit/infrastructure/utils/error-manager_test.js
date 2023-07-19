const { expect, hFake } = require ('../../../test-helper');
const {
  InvalidStaticCourseCreationOrUpdateError,
} = require('../../../../lib/domain/errors');
const { send } = require('../../../../lib/infrastructure/utils/error-manager');
//const {} = require('../../../../lib/infrastructure/errors');

describe('Unit | Infrastructure | ErrorManager', function() {
  describe('#send', function() {

    it('should convert InvalidStaticCourseCreationOrUpdateError', async function() {
      // given
      const error = new InvalidStaticCourseCreationOrUpdateError();
      error.addMandatoryFieldError({ field: 'name' });
      error.addDuplicatesForbiddenError({ field: 'challengeIds', duplicates: ['chalA', 'chalB'] });
      error.addUnknownResourcesError({ field: 'challengeIds', unknownResources: ['chalC', 'chalD'] });

      // when
      const response = await send(hFake, error);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [
          {
            code: 'MANDATORY_FIELD',
            source: {
              pointer: '/data/attributes/name',
            },
          },
          {
            code: 'DUPLICATES_FORBIDDEN',
            source: {
              pointer: '/data/attributes/challenge-ids',
            },
            detail: ['chalA', 'chalB'],
          },
          {
            code: 'UNKNOWN_RESOURCES',
            source: {
              pointer: '/data/attributes/challenge-ids',
            },
            detail: ['chalC', 'chalD'],
          },
        ],
      });
    });
  });
});
