import Component from '@glimmer/component';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { eq, or } from 'ember-truth-helpers';

export default class AdminEntityList extends Component {
  get lowercaseEntityName() {
    return this.args.schema.label.toLowerCase();
  }

  getKeyValue(row, key) {
    return row.properties[key];
  }

  getEnumLabel(row, field) {
    return field.options.find((option) => option.value === row.properties[field.key])?.label;
  }

  getColumnType(field) {
    switch (field.type) {
      case 'enum':
        return 'tag';
      case 'number':
        return 'number';
      default:
        return 'text';
    }
  }

  <template>
    <h1>Liste des {{this.lowercaseEntityName}}</h1>
    <br />
    <PixTable @data={{@entityList}} @caption="liste">
      <:columns as |row context|>
        {{#each @schema.fields as |field|}}
          <PixTableColumn @context={{context}} @type={{this.getColumnType field}}>
            <:header>
              {{field.label}}
            </:header>
            <:cell>
              {{#if (eq field.type "enum")}}
                <PixTag>
                  {{this.getEnumLabel row field}}
                </PixTag>
              {{else}}
                {{this.getKeyValue row field.key}}
              {{/if}}
            </:cell>
          </PixTableColumn>
        {{/each}}
      </:columns>
    </PixTable>
  </template>
}
