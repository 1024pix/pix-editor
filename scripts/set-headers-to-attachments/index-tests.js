const { setHeadersToAttachments } = require('.');
const nock = require('nock');

describe('Set headers to attachments', function() {
  it('set header Content-Disposition only to type attachments', async function() {
    process.env.TOKEN_URL = 'https://auth.cloud.ovh.net/v3/auth/tokens';
    process.env.BUCKET_USER = 'user';
    process.env.BUCKET_PASSWORD = 'password';
    process.env.STORAGE_TENANT = 'tenant name';

    const setHeaderToAttachmentApiCall = nock('https://dl.pix.fr')
      .matchHeader('X-Auth-Token', 'TOKEN')
      .matchHeader('Content-Disposition', 'attachment; filename="mailPJ2.png"')
      .matchHeader('Content-Type', 'image/png')
      .post('/attachment1.png')
      .reply(202);

    const setHeaderToIllustrationApiCall = nock('https://dl.pix.fr')
      .matchHeader('X-Auth-Token', 'TOKEN')
      .matchHeader('Content-Type', 'image/png')
      .post('/illustration1.png')
      .reply(202);

    const getTokenApiCall = nock('https://auth.cloud.ovh.net/v3')
      .post('/auth/tokens', {
        'auth': {
          'identity': {
            'methods': ['password'],
            'password': {
              'user': {
                'name': 'user',
                'domain': { 'id': 'default' },
                'password':'password'
              }
            }
          },
          'scope': {
            'project': {
              'name': 'tenant name',
              'domain': { 'id': 'default' }
            }
          }
        }
      })
      .reply(200, {}, {
        'x-subject-token': 'TOKEN'
      });

    nock.disableNetConnect();

    const attachments = [
      {
        'fields': {
          'id': 'attcKBWOyCUyATJ93',
          'Record ID': 'reczu9rZzvVD07Gme',
          'challengeId': ['some-challenge-id'],
          'filename': 'mailPJ.png',
          'mimeType': 'image/png',
          'size': 49502,
          'type': 'illustration',
          'url': 'https://dl.pix.fr/illustration1.png',
          'alt': 'alternative text',
        }
      },
      {
        'fields': {
          'id': 'attcKBWOyCUyATJ932',
          'Record ID': 'reczu9rZzvVD07Gme2',
          'challengeId': ['some-challenge-id'],
          'filename': 'mailPJ2.png',
          'mimeType': 'image/png',
          'size': 49502,
          'type': 'attachment',
          'url': 'https://dl.pix.fr/attachment1.png',
          'alt': '',
        }
      },
    ];

    await setHeadersToAttachments(attachments);
    setHeaderToAttachmentApiCall.done();
    setHeaderToIllustrationApiCall.done();
    getTokenApiCall.done();
  });
});
