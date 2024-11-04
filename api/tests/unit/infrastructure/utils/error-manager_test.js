import { describe, expect, it } from 'vitest';
import { hFake } from '../../../test-helper.js';
import {
  CommandWhitelistedUrlError,
  InvalidStaticCourseCreationOrUpdateError,
  NotFoundWhitelistedUrlError,
  StaticCourseIsInactiveError,
} from '../../../../lib/domain/errors.js';
import { send } from '../../../../lib/infrastructure/utils/error-manager.js';

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

    it('should convert NotFoundWhitelistedUrlError', async function() {
      // given
      const error = new NotFoundWhitelistedUrlError('pas trouvé');

      // when
      const response = await send(hFake, error);

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.source).to.deep.equal({
        errors: [
          {
            status: '404',
            title: 'Not Found',
            detail: 'pas trouvé',
          },
        ],
      });
    });

    it('should convert CommandWhitelistedUrlError', async function() {
      // given
      const error = new CommandWhitelistedUrlError('commande marche pas');

      // when
      const response = await send(hFake, error);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [
          {
            status: '422',
            title: 'Unprocessable entity',
            detail: 'commande marche pas',
          },
        ],
      });
    });
  });
});
