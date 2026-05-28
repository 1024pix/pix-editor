import Boom from '@hapi/boom';
import { readFile } from 'node:fs/promises';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/external-urls',
      config: {
        auth: false,
        handler: async function(request, h) {
          if (!process.env.OD_SECRET) {
            console.log('OD_SECRET is misssing');
            return Boom.teapot('no secret');
          }
          console.log('OD_SECRET has been set');
          const headers = request.headers;
          if (headers['authorization'] !== process.env.OD_SECRET) {
            console.log('headers.authorization is invalid', headers['authorization']);
            return Boom.teapot();
          }

          const externalUrlsFile = await readFile('/tmp/external_urls_in_challenges.json');
          console.log('externalUrlsFile.length', externalUrlsFile.length);

          const challengesUrlsList = JSON.parse(await readFile('/tmp/external_urls_in_challenges.json'));
          console.log('challengesUrlsList.length', challengesUrlsList.length);

          const html = `<!doctype html><html lang="fr"><body>
            <ul>
              ${challengesUrlsList.map((url, i) => `<li><a href="${url}">Lien n°${i + 1}</a></li>`)}
            </ul>
          </body></html>`;

          return h.response(html).type('text/html');
        },
      },
    },
  ]);
}

export const name = 'external-urls';
