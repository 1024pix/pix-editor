import { describe, expect, it } from 'vitest';
import { hFake } from '../../../test-helper.js';
import * as AllDomainErrors from '../../../../lib/domain/errors.js';
import { send } from '../../../../lib/infrastructure/utils/error-manager.js';

describe('Unit | Infrastructure | ErrorManager', function() {
  describe('#send', () => {
    it('should manage properly all DomainErrors into appropriate InfraError', () => {
      const message = 'error message';
      const attribute = 'attributeInError';
      for (const [domainErrorName, domainErrorClass] of Object.entries(AllDomainErrors)) {
        const error = new domainErrorClass(message, attribute);
        const expectErrorMessage = `Domain Error ${domainErrorName} not properly converted into InfraError`;
        const response = send(hFake, error);
        if (domainErrorName === 'DomainError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(500);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '500',
                title: 'Internal Server Error',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'NotFoundError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(404);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '404',
                title: 'Not Found',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'UserNotFoundError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(404);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '404',
                title: 'Not Found',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'MissionIntroductionMediaError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(500);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '500',
                title: 'Internal Server Error',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'InvalidMissionContentError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(500);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '500',
                title: 'Internal Server Error',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'StaticCourseIsInactiveError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(409);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '409',
                title: 'Conflict',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'ForbiddenError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(403);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '403',
                title: 'Forbidden',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'InvalidStaticCourseCreationOrUpdateError') {
          const errorStaticCourse = new domainErrorClass();
          errorStaticCourse.addError({ attribute: 'name', detail: 'Un texte détaillant une erreur' });
          errorStaticCourse.addError({ attribute: 'challengeIds', detail: 'le détail d\'une autre erreur' });
          const responseStaticCourse = send(hFake, errorStaticCourse);
          expect(responseStaticCourse.statusCode, expectErrorMessage).toStrictEqual(422);
          expect(responseStaticCourse.source).toStrictEqual({
            errors: [
              {
                status: '422',
                title: 'Unprocessable entity',
                detail: 'Un texte détaillant une erreur',
                source: {
                  pointer: '/data/attributes/name',
                },
              },
              {
                status: '422',
                title: 'Unprocessable entity',
                source: {
                  pointer: '/data/attributes/challenge-ids',
                },
                detail: 'le détail d\'une autre erreur',
              },
            ],
          });
        }
        else if (domainErrorName === 'NotFoundWhitelistedUrlError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(404);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '404',
                title: 'Not Found',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'CommandWhitelistedUrlForbiddenError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(403);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '403',
                title: 'Forbidden',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'CommandWhitelistedUrlConflictError') {
          expect(response.statusCode, expectErrorMessage).toStrictEqual(409);
          expect(response.source).toStrictEqual({
            errors: [
              {
                status: '409',
                title: 'Conflict',
                detail: 'error message',
              },
            ],
          });
        }
        else if (domainErrorName === 'CommandWhitelistedUrlError') {
          const errorCommandWhitelistedUrl = new domainErrorClass({ message, attribute });
          const responseCommandWhitelistedUrl = send(hFake, errorCommandWhitelistedUrl);
          expect(responseCommandWhitelistedUrl.statusCode, expectErrorMessage).toStrictEqual(422);
          expect(responseCommandWhitelistedUrl.source).toStrictEqual({
            errors: [
              {
                status: '422',
                title: 'Unprocessable entity',
                detail: 'error message',
                source: { pointer: '/data/attributes/attribute-in-error' },
              },
            ],
          });
        }
        else if (domainErrorName === 'TagTitleAlreadyUsedError') {
          const errorTagTitleAlreadyUsed = new domainErrorClass({ title: 'Internet' });
          const responseTagTitleAlreadyUsed = send(hFake, errorTagTitleAlreadyUsed);
          expect(responseTagTitleAlreadyUsed.statusCode, expectErrorMessage).toStrictEqual(409);
          expect(responseTagTitleAlreadyUsed.source).toStrictEqual({
            errors: [
              {
                status: '409',
                title: 'Conflict',
                detail: 'Echec de création du tag : le titre "Internet" est déjà pris"',
              },
            ],
          });
        }
        else {
          expect(true, `Conversion for ${domainErrorName} not tested`).to.be.false;
        }
      }
    });
  });
});
