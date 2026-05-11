import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import ModuleList from 'pixeditor/components/modules/modules-list';

<template>
  <header class="page-header">
    <h1 class="page-title">Modules</h1>
    <div class="page-actions">
      <PixButtonLink @route="authenticated.modules.new" class="pix-button-link-with-icon white-font">
        <PixIcon @name="add" @ariaHidden={{true}} />
        Créer un module
      </PixButtonLink>
    </div>
  </header>
  <main class="page-body">
    <section class="page-section">
      <ModuleList @modules={{@model.modules}} />
      <div class="modules-list__pagination">
        <PixPagination @pagination={{@model.modules.meta}} />
      </div>
    </section>
  </main>
</template>
