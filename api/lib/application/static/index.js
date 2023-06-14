exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/{param*}',
      options: {
        auth: false,
      },
      handler: {
        directory: {
          path: 'public/pix-editor',
          redirectToSlash: true
        }
      }
    }
  ]);
};

exports.name = 'static-api';
