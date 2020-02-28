const skillsController = require('./skills-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/skills',
      config: {
        auth: false,
        handler: skillsController.get,
        tags: ['airtable api']
      }
    },
  ]);
};

exports.name = 'skills-api';
