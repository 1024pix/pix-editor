import axios from 'axios';

import { expect, sinon } from '../../test-helper.js';
import { create } from '../../../lib/infrastructure/repositories/file-storage-token-repository.js';

describe('Unit | Repository | file-storage-token-repository', () => {
  describe('#create', () => {
    it('call axios', async function() {
      sinon.stub(axios, 'post').resolves({
        headers: { 'x-subject-token': '123' },
        data: {
          token: {
            expires_at: '2021-03-23Z00:00:00',
          },
        },
      });
      const token = await create();

      const expectedPayload = {
        'auth': {
          'identity': {
            'methods': ['password'],
            'password': {
              'user': {
                'name': 'storageUser',
                'domain': { 'id': 'default' },
                'password': 'storagePassword',
              }
            }
          },
          'scope': {
            'project': {
              'name': 'storageTenant',
              'domain': { 'id': 'default' }
            }
          }
        }
      };
      expect(axios.post).to.have.been.calledWith('https://storage.auth.example.net/api/auth', expectedPayload);
      expect(token).to.deep.equal({
        value: '123',
        expiresAt: '2021-03-23Z00:00:00'
      });
    });
  });
});
