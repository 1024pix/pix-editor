import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Select from 'pixeditor/components/field/select';

const options = {
  language: [
    { value: 'en', label: 'Anglais' },
    { value: 'fr', label: 'Français' },
  ],
};

export default class PopinPDFEntries extends Component {
  @tracked title = 'Liste des thèmes et des sujets abordés dans Pix';
  @tracked language = false;

  get selectedLanguage() {
    if (this.language) {
      return this.language;
    }
    return options.language.find((option) => option.value === 'fr')?.value;
  }

  @action
  setLanguage(language) {
    this.language = language;
  }

  @action
  setTitle(inputEvent) {
    this.title = inputEvent.target.value;
  }

  @action
  validate(e) {
    e.preventDefault();
    this.args.validateAction(this.title, this.selectedLanguage);
    this.closeModal();
  }

  @action
  closeModal() {
    this.args.close();
  }

  <template>
    <PixModal
      @title={{t "target_profile.pdf_export.title"}}
      @onCloseButtonClick={{this.closeModal}}
      @showModal={{@showModal}}
      @variant="orga"
    >
      <:content>
        <form class="pdf-entries" {{on "submit" this.validate}}>
          <div>
            <PixInput @value={{this.title}} class="field" {{on "input" this.setTitle}}>
              <:label>Titre</:label>
            </PixInput>
          </div>
          <div>
            <Select
              @value={{this.selectedLanguage}}
              @options={{options.language}}
              @onChange={{this.setLanguage}}
              @hideDefaultOption={{true}}
              @className="field"
            >
              <:label>{{t "target_profile.pdf_export.field.language"}}</:label>
            </Select>
          </div>
        </form>
      </:content>
      <:footer>
        <PixButton @backgroundColor="transparent-light" @isBorderVisible={{true}} @triggerAction={{this.closeModal}}>
          {{t "common.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{this.validate}} @iconBefore="check">
          {{t "common.validate"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
