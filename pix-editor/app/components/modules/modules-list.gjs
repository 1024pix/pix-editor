import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';

function getVisibilityColor(visibility) {
  return { public: 'green', private: 'grey' }[visibility];
}

<template>
  <PixTable @variant="modulix" @data={{@modules}} @caption="Liste des modules">
    <:columns as |module context|>
      <PixTableColumn @context={{context}}>
        <:header>
          Statut
        </:header>
        <:cell>
          <div class="modules-list__status">
            <PixTag @color={{getVisibilityColor module.visibility}}>
              {{module.visibilityForDisplay}}
            </PixTag>
            {{#if module.isBeta}}
              <PixTag @color="yellow">Beta</PixTag>
            {{/if}}
          </div>
        </:cell>
      </PixTableColumn>
      <PixTableColumn @context={{context}}>
        <:header>
          Titre interne
        </:header>
        <:cell>
          {{module.internalTitle}}
        </:cell>
      </PixTableColumn>
      <PixTableColumn @context={{context}}>
        <:header>
          Niveau
        </:header>
        <:cell>
          {{module.levelForDisplay}}
        </:cell>
      </PixTableColumn>
    </:columns>
  </PixTable>
</template>
