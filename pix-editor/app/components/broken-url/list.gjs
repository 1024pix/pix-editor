import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';

<template>
  <section class="page-section broken-urls-list">
    <PixTable @caption="Liste des URLs cassées" @condensed={{true}} @data={{@brokenUrls}} @variant="orga">
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
        <PixTableColumn @context={{context}} class="column--wide">
          <:header>Acquis</:header>
          <:cell>
            <div class="broken-urls-list__links">
              {{#each brokenUrl.skills as |skill|}}
                <PixButtonLink @route="authenticated.skill" @model={{skill.id}} @size="small" @variant="tertiary">
                  {{skill.name}}
                </PixButtonLink>
              {{/each}}
            </div>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}} class="column--wide">
          <:header>Épreuves</:header>
          <:cell>
            <div class="broken-urls-list__links">
              {{#each brokenUrl.localizedChallenges as |challenge|}}
                <PixButtonLink
                  @route="authenticated.challenge"
                  @model={{challenge.id}}
                  @size="small"
                  @variant="tertiary"
                >
                  {{challenge.id}}
                </PixButtonLink>
              {{/each}}
            </div>
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </section>
</template>
