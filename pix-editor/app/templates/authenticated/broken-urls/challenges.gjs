import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';

import BrokenUrlTabs from '../../../components/broken-url-list';

<template>
  <header class="page-header">
    <h1 class="page-title">Liste des URLs cassées</h1>
  </header>
  <main class="page-body">
    <section class="page-section tutorials-list">
      <BrokenUrlTabs />

      <PixTable
        @caption="Liste des URLs cassées"
        @condensed={{true}}
        @data={{@model.challengesBrokenUrls}}
        @variant="primary"
      >
        <:columns as |brokenUrl context|>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>URL</:header>
            <:cell>{{brokenUrl.url}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Statut de l'erreur</:header>
            <:cell>{{brokenUrl.statusCode}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Message d'erreur</:header>
            <:cell>{{brokenUrl.errorMessage}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Référentiel</:header>
            <:cell>
              <ul>
                {{#each brokenUrl.challenges as |challenge|}}
                  <li>{{challenge.framework_name}}</li>
                {{/each}}
              </ul>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Compétence</:header>
            <:cell>
              <ul>
                {{#each brokenUrl.challenges as |challenge|}}
                  <li>{{challenge.competence_name}}</li>
                {{/each}}
              </ul>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Acquis</:header>
            <:cell>
              <ul>
                {{#each brokenUrl.challenges as |challenge|}}
                  <li>{{challenge.skill_name}}</li>
                {{/each}}
              </ul>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>ID des épreuves concernées</:header>
            <:cell>
              <ul>
                {{#each brokenUrl.challenges as |challenge|}}
                  <li>{{challenge.challenge_id}}</li>
                {{/each}}
              </ul>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Status</:header>
            <:cell>
              <ul>
                {{#each brokenUrl.challenges as |challenge|}}
                  <li>{{challenge.challenge_status}}</li>
                {{/each}}
              </ul>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Locale</:header>
            <:cell>
              <ul>
                {{#each brokenUrl.challenges as |challenge|}}
                  <li>{{challenge.locale}}</li>
                {{/each}}
              </ul>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>

    </section>
  </main>
</template>
