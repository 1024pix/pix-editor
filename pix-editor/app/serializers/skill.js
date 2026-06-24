import ApplicationSerializer from './application';

export default class SkillSerializer extends ApplicationSerializer {
  attrs = {
    createdAt: { serialize: false },
  };
}
