import axios from 'axios';
import * as config from '../../config.js';

export async function create() {
  const payload = {
    'auth': {
      'identity': {
        'methods': ['password'],
        'password': {
          'user': {
            'name': config.storage.user,
            'domain': { 'id': 'default' },
            'password': config.storage.password,
          }
        }
      },
      'scope': {
        'project': {
          'name': config.storage.tenant,
          'domain': { 'id': 'default' }
        }
      }
    }
  };
  const response = await axios.post(config.storage.authUrl, payload);
  return {
    value: response.headers['x-subject-token'],
    expiresAt: response.data.token.expires_at,
  };
}
