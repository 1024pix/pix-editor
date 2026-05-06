import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import ModuleList from 'pixeditor/components/modules/modules-list';

<template>
  <header class="page-header">
    <h1 class="page-title">Modules</h1>
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
