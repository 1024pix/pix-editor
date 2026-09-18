import t from 'ember-intl/helpers/t';
import Pagination from 'pixeditor/components/list/pagination';
import CreateModuleButton from 'pixeditor/components/modules/create-module-button';
import ModuleList from 'pixeditor/components/modules/modules-list';
import ModulesTabs from 'pixeditor/components/modules/modules-tabs';

<template>
  <header class="page-header">
    <div class="modules-list__title">
      <img src="/assets/images/modulix/red-panda.png" alt="" class="modules-list__red-panda" />
      <h1 class="page-title">{{t "modules.workbench.title"}}</h1>
    </div>
    <div class="page-actions">
      <CreateModuleButton />
    </div>
  </header>
  <main class="page-body">
    <section class="page-section modules-list">
      <ModulesTabs />
      <ModuleList @modules={{@model.draftModules}} />
      <Pagination @pagination={{@model.draftModules.meta}} />
    </section>
  </main>
</template>
