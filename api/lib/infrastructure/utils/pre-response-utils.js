import * as errorManager from './error-manager.js';
import { DomainError } from '../../domain/errors.js';
import { InfrastructureError } from '../errors.js';
import * as config from '../../config.js';

export function catchDomainAndInfrastructureErrors(request, h) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof InfrastructureError) {
    return errorManager.send(h, response);
  }
  if (response.isBoom) {
    if (response.output.statusCode === 404 &&
        request.method === 'get' &&
        !request.path.startsWith('/api')) {
      return h.file(`${config.hapi.publicDir}/pix-editor/index.html`).code(200);
    }
  }

  return h.continue;
}
