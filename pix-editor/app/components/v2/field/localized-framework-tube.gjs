import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class LocalizedFrameworkTube extends Component {
  @service store;
  @service router;
  @tracked validationStatus = 'default';

  @tracked errorMessage = 'la valeur doit être comprise entre 0 et 8';

  @action
  updateMaxLevel(e) {
    const maxLevel = parseInt(e.target.value, 10);
    if (Number.isNaN(maxLevel) || 0 > maxLevel || maxLevel > 8) {
      this.args.inputStateList[this.args.index] = 'error';
      this.validationStatus = 'error';
      return;
    }
    this.args.updateMaxLevel(this.args.tube.id, maxLevel);
    this.args.inputStateList[this.args.index] = '';
    this.validationStatus = 'default';
  }

  <template>
    <PixInput
      max="8"
      min="0"
      type="number"
      @screenReaderOnly={{true}}
      @validationStatus={{this.validationStatus}}
      @errorMessage={{this.errorMessage}}
      @value={{@value}}
      {{on "change" this.updateMaxLevel}}
    >
      <:label>Modifier le niveau max du tube {{@tube.name}}</:label>
    </PixInput>
  </template>
}
