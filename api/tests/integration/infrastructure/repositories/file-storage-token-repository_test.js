import nock from 'nock';
import { describe, expect, it } from 'vitest';
import { create } from '../../../../lib/infrastructure/repositories/file-storage-token-repository.js';

describe('Integration | Repository | file-storage-token-repository', () => {
  describe('#create', () => {
    it('fetches correctly', async function() {
      const payload = {
        auth: {
          identity: {
            methods: ['password'],
            password: {
              user: {
                name: 'storageUser',
                domain: { id: 'default' },
                password: 'storagePassword',
              },
            },
          },
          scope: {
            project: {
              name: 'storageTenant',
              domain: { id: 'default' },
            },
          },
        },
      };

      const tokenScope = nock('https://storage.auth.example.net')
        .post('/api/auth', payload)
        .reply(200, { token: { expires_at: '2021-03-23Z00:00:00' } }, { 'x-subject-token': '123' });

      const token = await create();

      expect(tokenScope.isDone()).to.be.true;
      expect(token).to.deep.equal({
        value: '123',
        expiresAt: '2021-03-23Z00:00:00',
      });
    });
  });
});
