import DraftModuleDiff from 'pixeditor/components/modules/draft-module-diff';
import ModuleBackButton from 'pixeditor/components/modules/module-back-button';
import ModuleForm from 'pixeditor/components/modules/module-form';

<template>
  <header class="page-header">
    <h1 class="page-title">Détail du draft de module</h1>
  </header>
  <main class="page-body">
    <section class="page-section module-form">
      {{#if @model.draftModule.isEditionDraft}}
        <DraftModuleDiff
          @internalTitle={{@model.draftModule.internalTitle}}
          @htmlDiff={{@model.draftModuleDiff.htmlDiff}}
        />
      {{else}}
        <ModuleForm @module={{@model.draftModule}} @readonly={{true}} />
      {{/if}}
      <div class="page-actions">
        <ModuleBackButton />
      </div>
    </section>
  </main>
</template>
