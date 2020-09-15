const userRepository = require('../infrastructure/repositories/user-repository');
const JSONAPIError = require('jsonapi-serializer').Error;

module.exports = {
  checkUserIsAuthenticated,
};

async function checkUserIsAuthenticated(request, h) {
  if (!request.headers.authorization) {
    return _replyWithAuthenticationError(h);
  }
  const apiKey = request.headers.authorization.replace('Bearer ', '');
  try {
    const user = await userRepository.findByApiKey(apiKey);
    return h.authenticated({ credentials: { user } });
  }
  catch (error) {
    return _replyWithAuthenticationError(h);
  }
}

async function _replyWithAuthenticationError(h) {
  const errorHttpStatusCode = 401;

  const jsonApiError = new JSONAPIError({
    code: errorHttpStatusCode,
    title: 'Unauthorized access',
    detail: 'Missing or invalid access token in request auhorization headers.'
  });

  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}
