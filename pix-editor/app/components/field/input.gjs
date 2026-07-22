import { Input as Input0 } from '@ember/component';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import not from 'ember-truth-helpers/helpers/not';

export default class Input extends Component {
  <template>
    <div class={{concat "field" (if @edition "" " disabled")}} ...attributes>
      <p id="title-{{@id}}">{{@title}}</p>
      <div class="input">
        {{#if @label}}
          <label class="label-input" for={{@id}}>{{@label}} : </label>
        {{/if}}
        <Input0
          id={{@id}}
          @value={{@value}}
          aria-labelledby={{this.ariaLabeledBy}}
          placeholder={{@placeholder}}
          readonly={{not @edition}}
          {{on "change" this.change}}
        />
      </div>
    </div>
  </template>

  ariaLabeledBy = this.args.title && !this.args.label ? `title-${this.args.id}` : false;

  @action
  change(evt) {
    this.args.change?.(evt.target.value);
  }
}
