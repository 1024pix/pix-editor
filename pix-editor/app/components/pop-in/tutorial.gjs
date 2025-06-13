import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import TutorialForm from '../form/tutorial';

export default class TutorialPopIn extends Component {

  get hasEmptyMandatoryField() {
    const tutorial = this.args.tutorial;
    return tutorial && (
      this._fieldIsEmpty(tutorial.language)
      || this._fieldIsEmpty(tutorial.title)
      || this._fieldIsEmpty(tutorial.link)
      || this._fieldIsEmpty(tutorial.source)
      || this._fieldIsEmpty(tutorial.format)
      || this._fieldIsEmpty(tutorial.duration));
  }

  get title() {
    return `${this.args?.tutorial?.id ? 'Modifier' : 'Créer'} un tutoriel`;
  }

  _fieldIsEmpty(field) {
    return field === undefined || field.trim() === '';
  }

  <template>
    <PixModal
      @title={{this.title}}
      @onCloseButtonClick={{@close}}
      @showModal={{@showModal}}
    >
      <:content>
        {{#if @tutorial}}
          <TutorialForm @tutorial={{@tutorial}} />
        {{/if}}
      </:content>
      <:footer>
        <PixButton
          @backgroundColor="transparent-light"
          @isBorderVisible={{true}}
          @triggerAction={{@close}}
        >
          {{t 'common.cancel'}}
        </PixButton>
        <PixButton
          data-test-save-tutorial-button
          @triggerAction={{@saveTutorial}}
          @isDisabled={{this.hasEmptyMandatoryField}}
        >
          Enregistrer
          <i class="save icon"></i>
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
