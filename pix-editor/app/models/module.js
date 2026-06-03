import BaseModule from './base-module';

export default class Module extends BaseModule {
  get isDraft() {
    return false;
  }

  get isEditionDraft() {
    return false;
  }
}
