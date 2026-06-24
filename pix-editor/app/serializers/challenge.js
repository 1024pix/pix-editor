import ApplicationSerializer from './application';

export default class ChallengeSerializer extends ApplicationSerializer {
  attrs = {
    preview: { serialize: false },
  };
}
