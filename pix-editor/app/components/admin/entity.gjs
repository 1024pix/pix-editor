import Component from '@glimmer/component';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';

export default class AdminEntity extends Component {

  get lowercaseEntityName() {
    return this.args.schema.label.toLowerCase();
  }

  getKeyValue(row, key) {
    return row.properties[key];
  }

  <template>
    <h1>Liste des {{this.lowercaseEntityName}}</h1>
    <br>
    <PixTable @data={{@entityList}} @caption="liste">
      <:columns as |row context|>
        {{#each @schema.fields as |field|}}
          <PixTableColumn @context={{context}}>
            <:header>
              {{field.name}}
            </:header>
            <:cell>
              {{this.getKeyValue row field.key}}
            </:cell>
          </PixTableColumn>
        {{/each}}
      </:columns>
    </PixTable>
  </template>
}
