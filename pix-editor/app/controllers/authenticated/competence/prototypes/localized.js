import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LocalizedController extends Controller {

  @service router;

  @controller('authenticated.competence') competenceController;
  @controller('authenticated.competence.prototypes.single.alternatives') alternativesController;

  get previewUrl() {
    return new URL(`${this.model.challenge.get('preview')}?locale=${this.model.locale}`, window.location).href;
  }

  get challengeRoute() {
    return this.isPrototype ? 'authenticated.competence.prototypes.single' : 'authenticated.competence.prototypes.single.alternatives.single';
  }

  get challengeModels() {
    return this.isPrototype
      ? [this.model.challenge]
      : [this.model.challenge.get('relatedPrototype'), this.model.challenge];
  }

  get challengeTitle() {
    return this.isPrototype
      ? this.model.challenge.get('skillName')
      : `Déclinaison n°${this.model.challenge.get('alternativeVersion')}`;
  }

  get isPrototype() {
    return this.model.challenge.get('isPrototype');
  }

  get prototypeMaximized() {
    return this.competenceController.leftMaximized;
  }

  get alternativeMaximized() {
    return this.alternativesController.rightMaximized;
  }

  get maximized() {
    return this.isPrototype ? this.prototypeMaximized : this.alternativeMaximized;
  }

  @action maximize() {
    if (this.isPrototype) {
      this.competenceController.maximizeLeft(true);
    } else {
      this.alternativesController.maximizeRight(true);
    }
  }

  @action minimize() {
    if (this.isPrototype) {
      this.competenceController.maximizeLeft(false);
    } else {
      this.alternativesController.maximizeRight(false);
    }
  }

  @action close() {
    if (this.isPrototype) {
      this.router.transitionTo(
        'authenticated.competence.prototypes',
        this.competenceController.competence,
        { queryParams: { leftMaximized: false } },
      );
    } else {
      this.router.transitionTo(
        'authenticated.competence.prototypes.single.alternatives',
        this.competenceController.competence,
        this.alternativesController.challenge,
        { queryParams: { rightMaximized: false } },
      );
    }
  }
}
