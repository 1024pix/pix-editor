const axios = require('axios');

module.exports = async function getToken() {
  const data = {
    'auth': {
      'identity': {
        'methods': ['password'],
        'password': {
          'user': {
            'name': process.env.BUCKET_USER,
            'domain': { 'id': 'default' },
            'password': process.env.BUCKET_PASSWORD,
          }
        }
      },
      'scope': {
        'project': {
          'name': process.env.STORAGE_TENANT,
          'domain': { 'id': 'default' }
        }
      }
    }
  };

  const response = await axios.post(process.env.TOKEN_URL, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.headers['x-subject-token'];
};
