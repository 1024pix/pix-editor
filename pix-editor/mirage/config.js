import Mirage from 'ember-cli-mirage';

export default function () {

  this.namespace = 'api';

  this.get('/areas', ({ areas }, request) => _response(request, areas.all()));
  this.get('/users/me', ({ users }, request) => _response(request, users.first()));
  this.get('/config', ({ configs }, request) => _response(request, configs.first()));
  this.get('/airtable/content/Competences', (schema, request) => {
    const records = schema.competences.all().models.map((competence) => {
      return {
        id: competence.id,
        fields : {
          'Record ID': competence.id,
          'id persistant': competence.pixId,
          'Référence': competence.name,
          'Titre fr-fr': competence.title,
          'Sous-domaine': competence.code,
          'Tubes': competence.tubeIds,
          'Description': competence.description,
          'Origine': competence.source,
        }
      };
    });
    return _response(request, { records });
  });

}

function _response(request, responseData) {
  return _isRequestAuthorized(request) ? responseData : unauthorizedErrorResponse;
}

function _isRequestAuthorized(request) {
  const apiKey = request.requestHeaders && request.requestHeaders['Authorization'];
  return apiKey === 'Bearer valid-api-key';
}

const unauthorizedErrorResponse = new Mirage.Response(401);

