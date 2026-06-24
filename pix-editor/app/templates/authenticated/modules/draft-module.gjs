import DraftModuleDiff from 'pixeditor/components/modules/draft-module-diff';
import ModuleBackButton from 'pixeditor/components/modules/module-back-button';
import ModuleForm from 'pixeditor/components/modules/module-form';
import ModuleNotification from 'pixeditor/components/modules/module-notification';
import ModulePreviewButtons from 'pixeditor/components/modules/module-preview-buttons';

<template>
  <header class="page-header">
    <h1 class="page-title">Détail du draft de module</h1>
    <div class="page-actions">
      <ModulePreviewButtons @module={{@model.draftModule}} />
    </div>
  </header>
  <main class="page-body">
    <section class="page-section module-form">
      <ModuleNotification @module={{@model.draftModule}} />
      {{#if @model.draftModule.isEditionDraft}}
        <DraftModuleDiff @draftModule={{@model.draftModule}} @htmlDiff={{@model.draftModuleDiff.htmlDiff}} />
      {{else}}
        <ModuleForm @module={{@model.draftModule}} @readonly={{true}} />
      {{/if}}
      <div class="page-actions">
        <ModuleBackButton />
      </div>
    </section>
  </main>
</template>
