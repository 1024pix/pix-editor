import ApplicationSerializer from './application';

export default class ModuleSerializer extends ApplicationSerializer {
  attrs = {
    previewUrl: { serialize: false },
    url: { serialize: false },
  };
}
