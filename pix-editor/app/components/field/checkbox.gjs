import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import { concat } from '@ember/helper';
import { Input } from '@ember/component';

export default class Checkbox extends Component {
  <template>
    <div class="{{concat 'ui checkbox' (if @toggle ' toggle' '')}}" ...attributes>
      <Input id={{this.elementId}} @type="checkbox" @checked={{@checked}} disabled={{@disabled}} />
      <label for={{this.elementId}}>
        {{@label}}
      </label>
    </div>
  </template>

  ignorableAttrs = ['checked', 'label', 'disabled'];

  elementId = 'checkbox-' + guidFor(this);
}
