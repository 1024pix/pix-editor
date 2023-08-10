const { expect, hFake } = require ('../../../test-helper');
const {
  InvalidStaticCourseCreationOrUpdateError,
  StaticCourseIsInactiveError,
} = require('../../../../lib/domain/errors');
const { send } = require('../../../../lib/infrastructure/utils/error-manager');

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

    it('should convert StaticCourseIsInactiveError', async function() {
      // given
      const error = new StaticCourseIsInactiveError();

      // when
      const response = await send(hFake, error);

      // then
      expect(response.statusCode).to.equal(409);
      expect(response.source).to.deep.equal({
        errors: [
          {
            detail: 'Opération impossible sur un test statique inactif.',
            status: '409',
            title: 'Conflict',
          },
        ],
      });
    });
  });
});
