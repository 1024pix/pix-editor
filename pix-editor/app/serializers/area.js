import ApplicationSerializer from './application';

export default class AreaSerializer extends ApplicationSerializer {
  attrs = {
    name: { serialize: false },
  };
}
