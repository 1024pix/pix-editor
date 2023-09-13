export default async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/translations.csv',
      config: {
        handler: function(request, h) {
          return h.response('ok');
        }
      },
    },
  ]);
}

export const name = 'translations-api';

