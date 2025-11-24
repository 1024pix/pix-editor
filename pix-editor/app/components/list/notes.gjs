import { action } from '@ember/object';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';

import SortedList from './sorted';

export default class NoteList extends SortedList {
  @action
  selectRow(row) {
    this.args.show(row);
  }

  get list() {
    return Array.isArray(this.args.list) ? this.args.list : [];
  }

  get displayAuthor() {
    return this.args.displayAuthor ?? true;
  }

  get displayStatus() {
    return this.args.displayStatus ?? true;
  }

<template>
  <PixTable @data={{this.list}} @caption={{this.caption}} @onRowClick={{this.selectRow}}>
    <:columns as |row context|>
      <PixTableColumn @context={{context}} data-test-note>
        <:header>Date</:header>
        <:cell>{{row.date}}</:cell>
      </PixTableColumn>

      {{#if this.displayAuthor}}
          <PixTableColumn @context={{context}} class="author-note">
              <:header>Auteur</:header>
              <:cell>{{row.author}}</:cell>
          </PixTableColumn>
      {{/if}}

      <PixTableColumn @context={{context}}>
        <:header>Texte</:header>
        <:cell>{{row.text}}</:cell>
      </PixTableColumn>

      {{#if this.displayStatus}}
          <PixTableColumn @context={{context}} class="status-note">
              <:header>Statut</:header>
              <:cell>{{row.status}}</:cell>
          </PixTableColumn>
      {{/if}}
    </:columns>
  </PixTable>
</template>
}
