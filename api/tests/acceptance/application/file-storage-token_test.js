const nock = require('nock');
const { expect, databaseBuilder, generateAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | file-storage-token', () => {

  describe('POST /api/file-storage-token', () => {

    context('with an admin user', () => {
      let server;
      let options;

      beforeEach(async function() {
        const user = databaseBuilder.factory.buildAdminUser();
        await databaseBuilder.commit();
        server = await createServer();
        options = {
          method: 'POST',
          url: '/api/file-storage-token',
          headers: generateAuthorizationHeader(user)
        };
      });

      context('nominal case', () => {
        let nockAuthScope;

        beforeEach(async function() {
          nockAuthScope = nock('https://storage.auth.example.net')
            .post('/api/auth')
            .reply(200, {
              token: { expires_at: 456 },
            }, {
              'x-subject-token': 'my token',
            });
        });

        it('should return 200', async () => {
          const response = await server.inject(options);

          expect(response.statusCode).to.equal(200);
        });

        it('returns file storage auth token', async () => {
          const response = await server.inject(options);

          nockAuthScope.done();
          expect(response.result).to.deep.equal({
            token: 'my token'
          });
        });
      });

      context('when an error occurs on the remote storage side', () => {
        beforeEach(function() {
          nock('https://storage.auth.example.net')
            .post('/api/auth')
            .reply(401, {});
        });

        it('forward the status code', async function() {
          const response = await server.inject(options);

          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });

  context('with a readonly user', () => {
    it('returns a 403', async () => {
      const user = databaseBuilder.factory.buildReadonlyUser();
      await databaseBuilder.commit();
      const server = await createServer();
      const options = {
        method: 'POST',
        url: '/api/file-storage-token',
        headers: generateAuthorizationHeader(user)
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(403);
    });
  });
});
