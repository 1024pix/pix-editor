import Controller from '@ember/controller';

export default class LocalizedController extends Controller {

  get previewUrl() {
    return `${this.model.challenge.get('preview')}?locale=${this.model.locale}`;
  }

  get challengeRoute() {
    return this.model.challenge.get('isPrototype') ? 'authenticated.competence.prototypes.single' : 'authenticated.competence.prototypes.single.alternatives.single';
  }

  get challengeModels() {
    return this.model.challenge.get('isPrototype')
      ? [this.model.challenge]
      : [this.model.challenge.get('relatedPrototype'), this.model.challenge];
  }
}
