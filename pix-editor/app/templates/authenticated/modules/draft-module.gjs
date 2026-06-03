import ModuleForm from 'pixeditor/components/modules/module-form';
import ModuleBackButton from 'pixeditor/components/modules/module-back-button';

<template>
  <header class="page-header">
    <h1 class="page-title">Détail du draft de module</h1>
  </header>
  <main class="page-body">
    <section class="page-section module-form">
      <ModuleForm @module={{@model.draftModule}} @readonly={{true}} />
      <div class="page-actions">
        <ModuleBackButton @fromRoute={{@model.fromRoute}} />
      </div>
    </section>
  </main>
</template>
