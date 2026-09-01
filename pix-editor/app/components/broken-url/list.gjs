import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';

<template>
  <section class="page-section url-list">
    <PixTable @caption="Liste des URLs cassées" @condensed={{true}} @data={{@brokenUrls}} @variant="primary">
      <:columns as |brokenUrl context|>
        <PixTableColumn @context={{context}} class="column--wide">
          <:header>URL</:header>
          <:cell>{{brokenUrl.url}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}} class="column--tiny">
          <:header>Statut de l'erreur</:header>
          <:cell>{{brokenUrl.statusCode}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}} class="column--wide">
          <:header>Message d'erreur</:header>
          <:cell>{{brokenUrl.errorMessage}}</:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </section>
</template>
