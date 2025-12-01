import { action } from '@ember/object';
import { service } from '@ember/service';
import SortedList from './sorted';
import EmberTable from 'ember-table/components/ember-table/component';
import convertLanguageAsFlag from 'pixeditor/helpers/convert-language-as-flag';

export default class AlternativesList extends SortedList {
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
            {{#if r.columnValue.locales}}
              <div class="challenge_languages">
                {{#each r.rowValue.locales as |language|}}
                  <i class="{{convertLanguageAsFlag language}} flag" title="{{language}}"></i>
                {{/each}}
              </div>
            {{else}}
              {{value}}
            {{/if}}
          </r.cell>
        </b.row>
      </t.body>
    </EmberTable>
  </template>

  @service router;

  headers = [
    {
      name: 'Indice',
      valuePath: 'alternativeVersion',
      maxWidth: 50,
    },
    {
      name: 'Consigne',
      valuePath: 'instruction',
    },
    {
      name: 'Langue(s)',
      valuePath: 'locales',
      maxWidth: 80,
      minWidth: 75,
      locales: true,
    },
    {
      name: 'Auteur',
      valuePath: 'author',
      maxWidth: 80,
    },
    {
      name: 'Statut',
      valuePath: 'status',
      maxWidth: 130,
      style: true,
    },
  ];

  @action
  selectRow(row) {
    this.router.transitionTo('authenticated.competence.prototypes.single.alternatives.single', row);
  }
}
