import PixInput from '@1024pix/pix-ui/components/pix-input';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import not from 'ember-truth-helpers/helpers/not';

export default class Input extends Component {
  <template>
    <div class={{concat "field" (if @edition "" " disabled")}} ...attributes>
      <PixInput
        @inlineLabel={{true}}
        @screenReaderOnly={{@screenReaderOnly}}
        @value={{@value}}
        @isFullWidth={{true}}
        placeholder={{@placeholder}}
        readonly={{not @edition}}
        {{on "change" this.change}}
      >
        <:label>{{@label}} :</:label>
      </PixInput>
    </div>
  </template>

  @action
  change(evt) {
    this.args.change?.(evt.target.value);
  }
}
