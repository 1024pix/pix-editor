const serializer = require('../infrastructure/serializers/jsonapi/config-serializer');
const config = require('../config');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/config',
      config: {
        handler: function() {
          return serializer.serialize(config.pixEditor);
        },
      }
    },
  ]);
};

exports.name = 'config-api';

