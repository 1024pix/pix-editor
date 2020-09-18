import Mirage from 'ember-cli-mirage';

export default function () {

  this.namespace = 'api';

  this.get('/areas', ({ areas }, request) => _response(request, areas.all()));
  this.get('/users/me', ({ authors }, request) => _response(request, authors.first()));
  this.get('/config', ({ configs }, request) => _response(request, configs.first()));
  this.passthrough('https://api.airtable.com/v0/**');

}

function _response(request, responseData) {
  return _isRequestAuthorized(request) ? responseData : unauthorizedErrorResponse;
}

function _isRequestAuthorized(request) {
  return request.requestHeaders && request.requestHeaders['Authorization'];
}

const unauthorizedErrorResponse = new Mirage.Response(401);

