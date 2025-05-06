import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import Component from '@glimmer/component';

export default class Select extends Component {
  value = false;

  <template>
    {{#if @multiple}}
      <PixMultiSelect
        @id={{@id}}
        @values={{@value}}
        @placeholder={{if @defaultText @defaultText ""}}
        @ariaLabel={{if @title @title @ariaLabel}}
        @options={{@options}}
        @onChange={{@setValue}}
        @disabled={{if @edition false true}}
        @selected={{@value}}
      >
        <:label>
          {{@title}}
        </:label>
        <:default>
          {{#each @options as |option|}}
            {{#if option.label}}
              {{option.label}}
            {{else}}
              {{option}}
            {{/if}}
          {{/each}}
        </:default>
      </PixMultiSelect>
    {{else}}
      <PixSelect
        ...attributes
        @id={{@id}}
        @ariaLabel={{if @title @title @ariaLabel}}
        @options={{@options}}
        @disabled={{if @edition false true}}
        @onChange={{@setValue}}
        @value={{if @value @value @defaultValue}}
        @placeholder={{if @defaultText @defaultText @ariaLabel}}
        @hideDefaultOption={{true}}
      >
        <:label>
          {{@title}}
        </:label>
        <:default>
          {{#each @options as |option|}}
            {{#if option.label}}
              {{option.label}}
            {{else}}
              {{option}}
            {{/if}}
          {{/each}}
        </:default>
      </PixSelect>
    {{/if}}
  </template>
}
