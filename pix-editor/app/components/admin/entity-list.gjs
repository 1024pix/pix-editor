import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import AdminEntityCell from './entity-cell';

export default class AdminEntityList extends Component {
  @service router;

  get lowercaseEntityName() {
    return this.args.schema.label.toLowerCase();
  }

  get columns() {
    return this.args.schema.fields.map((field) => {
      const column = {
        columnType: this.getColumnType(field),
        field,
      };

      if (field.sortable === false) return column;

      const sortOrder = this.getFieldSortOrder(field);

      return {
        ...column,
        onSort: () => this.onFieldSort(field, sortOrder),
        sortOrder,
        ariaLabelDefaultSort: `Trier le tableau dans l'ordre croissant du champ ${field.label}`,
        ariaLabelSortAsc: 'Rétablir le tri par défaut du tableau',
        ariaLabelSortDesc: `Trier le tableau dans l'ordre décroissant du champ ${field.label}`,
      };
    });
  }

  get hasActions() {
    return !!this.args.actions.length;
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

  getFieldSortOrder(field) {
    if (!this.args.sort) return;

    let sortedField = this.args.sort;
    let sortOrder = 'asc';
    if (sortedField.startsWith('-')) {
      sortedField = sortedField.slice(1);
      sortOrder = 'desc';
    }

    if (sortedField !== field.key) return;

    return sortOrder;
  }

  onFieldSort(field, currentSortOrder) {
    let sort = field.key;
    if (currentSortOrder === 'asc') {
      sort = `-${sort}`;
    }
    if (currentSortOrder === 'desc') {
      sort = undefined;
    }
    this.router.replaceWith({ queryParams: { sort } });
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
        {{#each this.columns as |column|}}
          <PixTableColumn
            @context={{context}}
            @type={{column.type}}
            @onSort={{column.onSort}}
            @sortOrder={{column.sortOrder}}
            @ariaLabelDefaultSort={{column.ariaLabelDefaultSort}}
            @ariaLabelSortAsc={{column.ariaLabelSortAsc}}
            @ariaLabelSortDesc={{column.ariaLabelSortDesc}}
          >
            <:header>
              {{column.field.label}}
            </:header>
            <:cell>
              <AdminEntityCell @row={{row}} @field={{column.field}} />
            </:cell>
          </PixTableColumn>
        {{/each}}
        {{#if this.hasActions}}
          {{#each @actions as |actionDetails|}}
            <PixTableColumn @context={{context}} @type="text">
              <:header>Actions</:header>
              <:cell>
                <PixIconButton
                  @iconName={{actionDetails.iconName}}
                  @triggerAction={{fn @onDeleteEntity actionDetails row}}
                  @ariaLabel={{actionDetails.label}}
                />
              </:cell>
            </PixTableColumn>
          {{/each}}
        {{/if}}
      </:columns>
    </PixTable>
  </template>
}
