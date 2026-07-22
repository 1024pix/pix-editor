import { action } from '@ember/object';
import { service } from '@ember/service';
import EmberTable from 'ember-table/components/ember-table/component';
import { eq } from 'ember-truth-helpers';
import flagForLanguage from 'pixeditor/helpers/flag-for-language';

import SortedList from './sorted';

export default class ArchiveList extends SortedList {
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
            {{#if r.columnValue.yesno}}
              {{#if value}}
                Oui
              {{else}}
                Non
              {{/if}}
            {{else if r.columnValue.locales}}
              <div class="challenge_languages">
                {{#each r.rowValue.locales as |language|}}
                  <span
                    class="flag {{if (eq language 'fr-fr') 'flag--fr-fr' ''}}"
                    title="{{language}}"
                  >{{flagForLanguage language}}</span>
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

  list = [{ instruction: 'coucou' }];

  headers = [
    {
      name: 'Version',
      valuePath: 'version',
      maxWidth: 80,
    },
    {
      name: 'Prototype',
      valuePath: 'isPrototype',
      maxWidth: 80,
      yesno: true,
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
      maxWidth: 100,
    },
    {
      name: 'Statut',
      valuePath: 'status',
      maxWidth: 100,
      style: true,
    },
  ];

  @action
  selectRow(row) {
    this.router.transitionTo('authenticated.competence.skills.single.archive.single', row);
  }
}
