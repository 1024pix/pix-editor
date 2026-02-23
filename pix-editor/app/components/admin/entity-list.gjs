import Component from '@glimmer/component';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';

import AdminEntityCell from './entity-cell';

export default class AdminEntityList extends Component {
  get lowercaseEntityName() {
    return this.args.schema.label.toLowerCase();
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
    <div class="entity-list__header">
      <h1>Liste des {{this.lowercaseEntityName}}</h1>
      {{#if @schema.creatable}}
        <PixButtonLink @route="admin.entities.new" @variant="secondary" @iconBefore="add">
          Créer
        </PixButtonLink>
      {{/if}}
    </div>
    <PixTable @data={{@entityList}} @caption="liste">
      <:columns as |row context|>
        {{#each @schema.fields as |field|}}
          <PixTableColumn @context={{context}} @type={{this.getColumnType field}}>
            <:header>
              {{field.label}}
            </:header>
            <:cell>
              <AdminEntityCell @row={{row}} @field={{field}} />
            </:cell>
          </PixTableColumn>
        {{/each}}
      </:columns>
    </PixTable>
  </template>
}
