import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import Component from '@glimmer/component';

export default class BrokenUrlList extends Component {
  constructor(...args) {
    super(...args);

    console.log('MODEL', this.args.brokenUrls);
  }

  <template>
    <PixTable @caption="Liste des URLs cassées" @condensed={{true}} @data={{@brokenUrls}} @variant="primary">
      <:columns as |brokenUrl context|>
        <PixTableColumn @context={{context}} class="column--wide">
          <:header>URL</:header>
          <:cell>{{brokenUrl.url}}</:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </template>
}
