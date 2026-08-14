import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class ModuleValidationTag extends Component {
  @service intl;

  get validationStatus() {
    return this.args.hasBeenValidated;
  }

  get validationStatusInformation() {
    return this.validationStatus
      ? { label: this.intl.t('modules.draft-module.validation-success'), color: 'green', state: 'success' }
      : { label: this.intl.t('modules.draft-module.validation-failure'), color: 'error', state: 'failure' };
  }

  <template>
    <PixTag @color={{this.validationStatusInformation.color}}>
      <span class="draft-module-header__tag--{{this.validationStatusInformation.state}}">&#9679;</span>
      {{this.validationStatusInformation.label}}
    </PixTag>
  </template>
}
