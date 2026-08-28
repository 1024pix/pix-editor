import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import Component from '@glimmer/component';

export default class BrokenUrlList extends Component {
  constructor(...args) {
    super(...args);
  }

  <template>
    <PixTable @caption="Liste des URLs cassées" @condensed={{true}} @data={{@brokenUrls}} @variant="primary">
      <:columns as |brokenUrl context|>
        <PixTableColumn @context={{context}} class="column--wide">
          <:header>URL</:header>
          <:cell>{{brokenUrl.url}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}} class="column--wide">
          <:header>ID des challenges concernés</:header>
          <:cell>
            {{#each brokenUrl.challenges as |challenge|}}
              Challenge
              {{log challenge.challenge_id}}
            {{/each}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}} class="column--wide">
          <:header>ID des tutoriels concernés</:header>
          <:cell>
            {{#each brokenUrl.tutorials as |tutorial|}}
              {{tutorial.id}}
            {{/each}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </template>
}
