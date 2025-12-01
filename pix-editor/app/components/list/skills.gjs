import { action } from '@ember/object';
import { service } from '@ember/service';
import SortedList from './sorted';
import EmberTable from 'ember-table/components/ember-table/component';

export default class ListSkillsComponent extends SortedList {
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
        <b.row data-test-skill-row class="challenge-prototype" as |r|>
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
      maxWidth: 100,
    },
    {
      name: 'Description',
      valuePath: 'description',
    },
    {
      name: 'Epreuves',
      valuePath: 'challenges.length',
      maxWidth: 200,
    },
    {
      name: 'Statut',
      valuePath: 'status',
      maxWidth: 200,
      style: true,
    },
  ];

  @action
  selectRow(skill) {
    this.router.transitionTo('authenticated.competence.skills.single', skill);
  }
}
