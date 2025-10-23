import { describe, expect, it } from 'vitest';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/error-serializer.js';
import * as AllInfraErrors from '../../../../../lib/infrastructure/errors.js';

describe('Unit | Serializer | JSONAPI | error-serializer', () => {
  describe('#serialize', () => {
    it('should serialize an InfraError', () => {
      const message = 'error message';
      for (const [infraErrorName, infraErrorClass] of Object.entries(AllInfraErrors)) {
        const error = new infraErrorClass(message);
        const serializedError = serialize(error);
        if (infraErrorName === 'InfrastructureError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '500',
                title: 'Internal Server Error',
                detail: 'error message',
              },
            ],
          });
        } else if (infraErrorName === 'UnprocessableEntityError') {
          // without attribute
          const errorWithoutAttribute = new infraErrorClass({ message });
          const serializedErrorWithoutAttribute = serialize(errorWithoutAttribute);
          expect(serializedErrorWithoutAttribute, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '422',
                title: 'Unprocessable entity',
                detail: 'error message',
              },
            ],
          });
          // with attribute
          const errorWithAttribute = new infraErrorClass({ message, attribute: 'myAwesomeAttribute' });
          const serializedErrorWithAttribute = serialize(errorWithAttribute);
          expect(serializedErrorWithAttribute, `Bad serialization for ${infraErrorName} with attribute`).toStrictEqual({
            errors: [
              {
                status: '422',
                title: 'Unprocessable entity',
                detail: 'error message',
                source: { pointer: '/data/attributes/my-awesome-attribute' },
              },
            ],
          });
          // with detail
          const errorWithDetail = new infraErrorClass({ message, detail: 'un détail' });
          const serializedErrorWithDetail = serialize(errorWithDetail);
          expect(serializedErrorWithDetail, `Bad serialization for ${infraErrorName} with detail`).toStrictEqual({
            errors: [
              {
                status: '422',
                title: 'Unprocessable entity',
                detail: 'un détail',
              },
            ],
          });
        } else if (infraErrorName === 'PreconditionFailedError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '421',
                title: 'Precondition Failed',
                detail: 'error message',
              },
            ],
          });
        } else if (infraErrorName === 'ConflictError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '409',
                title: 'Conflict',
                detail: 'error message',
              },
            ],
          });
        } else if (infraErrorName === 'MissingQueryParamError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '400',
                title: 'Missing Query Parameter',
                detail: 'Missing error message query parameter.',
              },
            ],
          });
        } else if (infraErrorName === 'MissingQueryParamError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '400',
                title: 'Missing error message query parameter.',
                detail: 'error message',
              },
            ],
          });
        } else if (infraErrorName === 'NotFoundError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '404',
                title: 'Not Found',
                detail: 'error message',
              },
            ],
          });
        } else if (infraErrorName === 'UnauthorizedError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '401',
                title: 'Unauthorized',
                detail: 'error message',
              },
            ],
          });
        } else if (infraErrorName === 'ForbiddenError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '403',
                title: 'Forbidden',
                detail: 'error message',
              },
            ],
          });
        } else if (infraErrorName === 'BadRequestError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '400',
                title: 'Bad Request',
                detail: 'error message',
              },
            ],
          });
        } else {
          expect(true, `Serialization for ${infraErrorName} not tested`).to.be.false;
        }
      }
    });

    it('should serialize several InfraErrors', () => {
      const message1 = 'error message 1';
      const message2 = 'error message 2';
      for (const [infraErrorName, infraErrorClass] of Object.entries(AllInfraErrors)) {
        const error1 = new infraErrorClass(message1);
        const error2 = new infraErrorClass(message2);
        const serializedError = serialize([error1, error2]);
        if (infraErrorName === 'InfrastructureError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '500',
                title: 'Internal Server Error',
                detail: 'error message 1',
              },
              {
                status: '500',
                title: 'Internal Server Error',
                detail: 'error message 2',
              },
            ],
          });
        } else if (infraErrorName === 'UnprocessableEntityError') {
          const error1Infra = new infraErrorClass({ message: message1 });
          const error2Infra = new infraErrorClass({ message: message2 });
          const serializedError = serialize([error1Infra, error2Infra]);
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '422',
                title: 'Unprocessable entity',
                detail: 'error message 1',
              },
              {
                status: '422',
                title: 'Unprocessable entity',
                detail: 'error message 2',
              },
            ],
          });
        } else if (infraErrorName === 'PreconditionFailedError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '421',
                title: 'Precondition Failed',
                detail: 'error message 1',
              },
              {
                status: '421',
                title: 'Precondition Failed',
                detail: 'error message 2',
              },
            ],
          });
        } else if (infraErrorName === 'ConflictError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '409',
                title: 'Conflict',
                detail: 'error message 1',
              },
              {
                status: '409',
                title: 'Conflict',
                detail: 'error message 2',
              },
            ],
          });
        } else if (infraErrorName === 'MissingQueryParamError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '400',
                title: 'Missing Query Parameter',
                detail: 'Missing error message 1 query parameter.',
              },
              {
                status: '400',
                title: 'Missing Query Parameter',
                detail: 'Missing error message 2 query parameter.',
              },
            ],
          });
        } else if (infraErrorName === 'MissingQueryParamError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '400',
                title: 'Missing error message query parameter.',
                detail: 'error message 1',
              },
              {
                status: '400',
                title: 'Missing error message query parameter.',
                detail: 'error message 2',
              },
            ],
          });
        } else if (infraErrorName === 'NotFoundError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '404',
                title: 'Not Found',
                detail: 'error message 1',
              },
              {
                status: '404',
                title: 'Not Found',
                detail: 'error message 2',
              },
            ],
          });
        } else if (infraErrorName === 'UnauthorizedError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '401',
                title: 'Unauthorized',
                detail: 'error message 1',
              },
              {
                status: '401',
                title: 'Unauthorized',
                detail: 'error message 2',
              },
            ],
          });
        } else if (infraErrorName === 'ForbiddenError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '403',
                title: 'Forbidden',
                detail: 'error message 1',
              },
              {
                status: '403',
                title: 'Forbidden',
                detail: 'error message 2',
              },
            ],
          });
        } else if (infraErrorName === 'BadRequestError') {
          expect(serializedError, `Bad serialization for ${infraErrorName}`).toStrictEqual({
            errors: [
              {
                status: '400',
                title: 'Bad Request',
                detail: 'error message 1',
              },
              {
                status: '400',
                title: 'Bad Request',
                detail: 'error message 2',
              },
            ],
          });
        } else {
          expect(true, `Serialization for ${infraErrorName} not tested`).to.be.false;
        }
      }
    });
  });
});
