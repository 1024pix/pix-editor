const nock = require('nock');
const { expect, sinon } = require('../../test-helper');
const pixApiClient = require('../../../lib/infrastructure/pix-api-client');
const cache = require('../../../lib/infrastructure/cache');

describe('Unit | Infrastructure | PIX API Client', () => {

  describe('#request', () => {
    context('when token is in cache', () => {
      it('should call the API', async () => {
        // given
        const payload = 'payload';
        const token = 'token';
        sinon.stub(cache, 'get').withArgs('pix-api-token').returns(token);

        const requestInterceptor = nock('https://api.test.pix.fr')
          .patch('/api/cache/model/id', payload)
          .matchHeader('Authorization', `Bearer ${token}`)
          .reply(200);

        // when
        await pixApiClient.request({ url: '/api/cache/model/id', payload });

        // then
        expect(requestInterceptor.isDone()).to.be.true;
      });

      it('should refresh the token when receiving a 401', async () => {
        // given
        const payload = 'payload';
        const token = 'token';
        const newToken = 'myNewToken';
        sinon.stub(cache, 'get').withArgs('pix-api-token').returns(token);

        const firstRequestInterceptor = nock('https://api.test.pix.fr')
          .patch('/api/cache/model/id', payload)
          .matchHeader('Authorization', `Bearer ${token}`)
          .reply(401);

        const authInterceptor = nock('https://api.test.pix.fr')
          .post('/api/token', 'username=adminUser&password=123&grant_type=password')
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': newToken });

        const secondRequestInterceptor = nock('https://api.test.pix.fr')
          .patch('/api/cache/model/id', payload)
          .matchHeader('Authorization', `Bearer ${newToken}`)
          .reply(200);

        // when
        await pixApiClient.request({ url: '/api/cache/model/id', payload });

        // then
        expect(firstRequestInterceptor.isDone()).to.be.true;
        expect(authInterceptor.isDone()).to.be.true;
        expect(secondRequestInterceptor.isDone()).to.be.true;
      });

      it('should not refresh the token forever and returns the error', async () => {
        // given
        const payload = 'payload';
        const token = 'token';
        const newToken = 'myNewToken';
        sinon.stub(cache, 'get').withArgs('pix-api-token').returns(token);

        const firstRequestInterceptor = nock('https://api.test.pix.fr')
          .patch('/api/cache/model/id', payload)
          .matchHeader('Authorization', `Bearer ${token}`)
          .reply(401);

        const authInterceptor = nock('https://api.test.pix.fr')
          .post('/api/token', 'username=adminUser&password=123&grant_type=password')
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': newToken });

        const secondRequestInterceptor = nock('https://api.test.pix.fr')
          .patch('/api/cache/model/id', payload)
          .matchHeader('Authorization', `Bearer ${newToken}`)
          .reply(401);

        try {
          // when
          await pixApiClient.request({ url: '/api/cache/model/id', payload });
          expect.fail('should raise an error');
        } catch (e) {
          expect(e.response.status).to.equal(401);
        }

        // then
        expect(firstRequestInterceptor.isDone()).to.be.true;
        expect(authInterceptor.isDone()).to.be.true;
        expect(secondRequestInterceptor.isDone()).to.be.true;

      });
    });

    context('when token is not in cache', () => {
      it('should authenticate', async () => {
        const payload = 'payload';
        const token = 'token';
        sinon.stub(cache, 'get').withArgs('pix-api-token').returns(null);

        const requestInterceptor = nock('https://api.test.pix.fr')
          .patch('/api/cache/model/id', payload)
          .matchHeader('Authorization', `Bearer ${token}`)
          .reply(200);

        const authInterceptor = nock('https://api.test.pix.fr')
          .post('/api/token', 'username=adminUser&password=123&grant_type=password')
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': token });

        // when
        await pixApiClient.request({ url: '/api/cache/model/id', payload });

        // then
        expect(requestInterceptor.isDone()).to.be.true;
        expect(authInterceptor.isDone()).to.be.true;
      });

      it('should store token in cache', async () => {
        const payload = 'payload';
        const token = 'token';
        sinon.stub(cache, 'get').withArgs('pix-api-token').returns(null);
        sinon.stub(cache, 'set').withArgs('pix-api-token');

        nock('https://api.test.pix.fr')
          .patch('/api/cache/model/id', payload)
          .matchHeader('Authorization', `Bearer ${token}`)
          .reply(200);

        nock('https://api.test.pix.fr')
          .post('/api/token', 'username=adminUser&password=123&grant_type=password')
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': token });

        // when
        await pixApiClient.request({ url: '/api/cache/model/id', payload });

        // then
        expect(cache.set).to.have.been.called;
      });
    });

  });
});
