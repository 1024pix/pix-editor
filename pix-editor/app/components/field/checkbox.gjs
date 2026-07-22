import { Input } from '@ember/component';
import { concat } from '@ember/helper';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';

export default class Checkbox extends Component {
  <template>
    <div class="{{concat 'checkbox' (if @toggle ' checkbox--toggle' '')}}" ...attributes>
      <Input id={{this.elementId}} @type="checkbox" @checked={{@checked}} disabled={{@disabled}} />
      <label for={{this.elementId}}>
        {{@label}}
      </label>
    </div>
  </template>

  ignorableAttrs = ['checked', 'label', 'disabled'];

  elementId = 'checkbox-' + guidFor(this);
}
