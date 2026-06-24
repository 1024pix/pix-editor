import ApplicationSerializer from './application';

export default class DraftModuleSerializer extends ApplicationSerializer {
  attrs = {
    previewUrl: { serialize: false },
    url: { serialize: false },
  };
}
