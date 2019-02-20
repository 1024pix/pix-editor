import UiModal from 'semantic-ui-ember/components/ui-modal';
import $ from 'jquery';

export default UiModal.extend({
  classNameBindings: ['class'],
  willInitSemantic(settings) {
    this._super(...arguments);
    // remove any previously created modal with same class name
    $(`.${this.get('class')}`).remove();
    settings.detachable = true;
  }
});
