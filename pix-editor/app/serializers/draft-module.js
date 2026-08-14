import ApplicationSerializer from './application';

export default class DraftModuleSerializer extends ApplicationSerializer {
  attrs = {
    diff: { serialize: false },
    shortId: { serialize: false },
    previewUrl: { serialize: false },
    url: { serialize: false },
    hasBeenValidated: { serialize: false },
    validationErrors: { serialize: false },
    updatedAt: { serialize: false },
  };
}
