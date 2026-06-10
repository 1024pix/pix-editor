import { action } from '@ember/object';
import { service } from '@ember/service';
import EmberTable from 'ember-table/components/ember-table/component';

import SortedList from './sorted';

export default class PrototypesList extends SortedList {
  <template>
    <EmberTable as |t|>
      <t.head
        @columns={{this.headers}}
        @widthConstraint="gte-container"
        @resizeMode="fluid"
        @onUpdateSorts={{this.sortBy}}
        @sortFunction={{this.sort}}
        @sorts={{this.sorts}}
      />
      <t.body
        @renderAll={{this.renderAll}}
        @rows={{@list}}
        @rowSelectionMode="single"
        @checkboxSelectionMode="none"
        @onSelect={{this.selectRow}}
        as |b|
      >
        <b.row as |r|>
          <r.cell class="{{if r.columnValue.style r.rowValue.statusCSS}}" as |value|>
            {{value}}
          </r.cell>
        </b.row>
      </t.body>
    </EmberTable>
  </template>

  @service router;

  headers = [
    {
      name: 'Version',
      valuePath: 'version',
      maxWidth: 150,
    },
    {
      name: 'Consigne',
      valuePath: 'instruction',
    },
    {
      name: 'Auteur',
      valuePath: 'author',
      maxWidth: 150,
    },
    {
      name: 'Statut',
      valuePath: 'computedStatus',
      maxWidth: 150,
      style: true,
    },
  ];

  sortTypes = {
    Version: 'string',
    instruction: 'string',
    type: 'string',
    status: 'string',
  };

  @action
  selectRow(row) {
    this.router.transitionTo('authenticated.competence.prototypes.single', row);
  }
}
