import { action } from '@ember/object';
import { service } from '@ember/service';
import EmberTable from 'ember-table/components/ember-table/component';

import SortedList from './sorted';

export default class CompetencesList extends SortedList {
  <template>
    <EmberTable as |t|>
      <t.head
        @columns={{this.headers}}
        @widthConstraint="gte-container"
        @resizeMode="fluid"
        @onUpdateSorts={{this.sortBy}}
        @sorts={{this.sorts}}
        @sortFunction={{this.sort}}
      />
      <t.body
        @renderAll={{this.renderAll}}
        @rows={{@list}}
        @rowSelectionMode="single"
        @checkboxSelectionMode="none"
        @onSelect={{this.selectRow}}
        @selection={{this.current}}
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
  @service currentData;

  headers = [
    {
      name: 'Auteur',
      valuePath: 'authorText',
      maxWidth: 150,
    },
    {
      name: 'Consigne',
      valuePath: 'instruction',
    },
    {
      name: 'Modalité',
      valuePath: 'type',
      maxWidth: 150,
    },
    {
      name: 'Statut',
      valuePath: 'status',
      maxWidth: 150,
      style: true,
    },
  ];

  sortTypes = {
    authorText: 'string',
    instruction: 'string',
    type: 'string',
    status: 'string',
  };

  get current() {
    return this.currentData.getPrototype();
  }

  @action
  selectRow(row) {
    this.router.transitionTo(this.args.link, this.args.competenceModel, row);
  }
}
