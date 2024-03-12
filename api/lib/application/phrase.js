import * as securityPreHandlers from './security-pre-handlers.js';
import { downloadTranslationFromPhrase, uploadTranslationToPhrase } from '../domain/usecases/index.js';

export async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/phrase/upload',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          await uploadTranslationToPhrase();
          return h.response();
        }
      },
    },
    {
      method: 'POST',
      path: '/api/phrase/download',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          await downloadTranslationFromPhrase();
          return h.response();
        }
      },
    },
  ]);
}

export const name = 'phrase-api';
