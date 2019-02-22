import UiModal from 'semantic-ui-ember/components/ui-modal';
import $ from 'jquery';

export default UiModal.extend({
  classNameBindings: ['class'],
  willInitSemantic(settings) {
    this._super(...arguments);
    // remove any previously created modal with same class name
    try {
      $(`.${this.get('class')}`).remove();
    } catch(e)
    {
      console.log('could not remove element');
    }
    settings.detachable = true;
  }
});
