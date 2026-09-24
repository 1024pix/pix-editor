import PixSelect from '@1024pix/pix-ui/components/pix-select';
import Component from '@glimmer/component';

export default class Select extends Component {
  get texts() {
    return {
      emptySearchMessage: 'Aucune option',
      placeholder: 'Sélectionner',
      searchPlaceholder: 'Rechercher...',
      selectSearchLabel: 'Rechercher',
      subLabel: '',
      requiredLabel: this.args?.required ? 'Champ obligatoire' : null,
      ...this.args.texts,
    };
  }

  <template>
    <PixSelect
      @className={{@className}}
      @errorMessage={{@errorMessage}}
      @hideDefaultOption={{@hideDefaultOption}}
      @id={{@id}}
      @iconName={{@iconName}}
      @inlineLabel={{@inlineLabel}}
      @isComputeWidthDisabled={{@isComputeWidthDisabled}}
      @isDisabled={{@isDisabled}}
      @isFullWidth={{@isFullWidth}}
      @isSearchable={{@isSearchable}}
      @onChange={{@onChange}}
      @onSearch={{@onSearch}}
      @options={{@options}}
      @placement={{@placement}}
      @plainIcon={{@plainIcon}}
      @screenReaderOnly={{@screenReaderOnly}}
      @size={{@size}}
      @texts={{this.texts}}
      @value={{@value}}
      ...attributes
    >
      <:label>
        {{yield to="label"}}
      </:label>
    </PixSelect>
  </template>
}
