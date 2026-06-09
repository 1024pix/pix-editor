import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import not from 'ember-truth-helpers/helpers/not';
import List from 'pixeditor/components/whitelisted-urls/list';
<template>
  <header class="page-header">
    <h1 class="page-title">URLs à ne pas analyser dans les moulinettes</h1>
    <div class="page-actions">
      <PixTooltip
        @id="create-whitelisted-url-tooltip"
        @position="bottom-left"
        @hide={{@controller.model.mayCreateWhitelistedUrl}}
      >
        <:triggerElement>
          <PixButtonLink
            @route="authenticated.whitelisted-urls.new"
            @backgroundColor="blue"
            @isDisabled={{not @controller.model.mayCreateWhitelistedUrl}}
            aria-describedby="create-whitelisted-url-tooltip"
            class="pix-button-link-with-icon white-font"
          >
            <PixIcon @name="add" @ariaHidden={{true}} />
            Ajouter une nouvelle URL
          </PixButtonLink>
        </:triggerElement>

        <:tooltip>
          Vous n'avez pas les droits suffisants pour ajouter une URL.
        </:tooltip>
      </PixTooltip>
    </div>
  </header>
  <main class="page-body">
    <section class="page-section">
      <List
        @whitelistedUrls={{@controller.filteredWhitelistedUrls}}
        @urlFilterValue={{@controller.url}}
        @namesFilterValue={{@controller.names}}
        @onApplyFiltersClicked={{@controller.applyFilters}}
        @onClearFiltersClicked={{@controller.clearFilters}}
        @onDeleteItemClicked={{@controller.deleteUrl}}
        @goToEditWhitelistedUrl={{@controller.goToEditWhitelistedUrl}}
      />
    </section>
  </main>
</template>
