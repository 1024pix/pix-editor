const nock = require('nock');
const { expect, databaseBuilder, generateAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | file-storage-token', () => {

  describe('POST /api/file-storage-token', () => {
    let server;
    let options;

    beforeEach(async function() {
      const user = databaseBuilder.factory.buildUser({ name: 'User', trigram: 'ABC', access: 'admin', apiKey:'11b2cab8-050e-4165-8064-29a1e58d8997' });
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
