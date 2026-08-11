import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import CreateModuleButton from 'pixeditor/components/modules/create-module-button';
import ModuleList from 'pixeditor/components/modules/modules-list';
import ModulesTabs from 'pixeditor/components/modules/modules-tabs';

<template>
  <header class="page-header">
    <h1>Modules</h1>
    <div class="page-actions">
      <CreateModuleButton />
    </div>
  </header>
  <main class="page-body">
    <section class="page-section modules-list">
      <ModulesTabs />
      <ModuleList @modules={{@model.modules}} @showStatus={{true}} @goToDetailPage={{this.goToDetailPage}} />
      <PixPagination @pagination={{@model.modules.meta}} />
    </section>
  </main>
</template>
