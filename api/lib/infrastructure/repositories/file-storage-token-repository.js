import * as config from '../../config.js';
import { ErrorWithStatusCode, UnauthorizedError } from '../errors.js';

export async function create() {
  const payload = {
    auth: {
      identity: {
        methods: ['password'],
        password: {
          user: {
            name: config.storage.user,
            domain: { id: 'default' },
            password: config.storage.password,
          },
        },
      },
      scope: {
        project: {
          name: config.storage.tenant,
          domain: { id: 'default' },
        },
      },
    },
  };
  const response = await fetch(config.storage.authUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (response.status === 401) throw new UnauthorizedError();
  if (!response.ok) throw new Error('error while fetching file storage token', response.status);
  const jsonResponse = await response.json();

  return {
    value: response.headers.get('x-subject-token'),
    expiresAt: jsonResponse.token.expires_at,
  };
}
