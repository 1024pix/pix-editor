import UiModal from 'semantic-ui-ember/components/ui-modal';
import $ from 'jquery';

export default UiModal.extend({
  classNameBindings: ['class'],
  willInitSemantic(settings) {
    this._super(...arguments);
    settings.detachable=true;
  },
  didDestroyElement() {
    try {
      $(`.${this.get('class')}`).remove();
    } catch(e)
    {
      console.log('could not remove element');
    }
  }
});
