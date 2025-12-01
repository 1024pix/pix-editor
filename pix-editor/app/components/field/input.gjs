import { action } from '@ember/object';
import Component from '@glimmer/component';
import { concat } from '@ember/helper';
import { Input as Input0 } from '@ember/component';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';

export default class Input extends Component {
  <template>
    <div class={{concat "field" (if @edition "" " disabled")}} ...attributes>
      <p>{{@title}}</p>
      <div class="ui input">
        {{#if @label}}
          <label class="label-input" for={{@id}}>{{@label}} : </label>
        {{/if}}
        <Input0
          id={{@id}}
          @value={{@value}}
          placeholder={{@placeholder}}
          readonly={{not @edition}}
          {{on "change" this.change}}
        />
      </div>
    </div>
  </template>

  @action
  change(evt) {
    this.args.change?.(evt.target.value);
  }
}
