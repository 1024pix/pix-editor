import ModuleBackButton from 'pixeditor/components/modules/module-back-button';
import ModuleForm from 'pixeditor/components/modules/module-form';

<template>
  <header class="page-header">
    <h1 class="page-title">Détail du module</h1>

  </header>
  <main class="page-body">
    <section class="page-section module-form">
      <ModuleForm @module={{@model.module}} @readonly={{true}} />
      <div class="page-actions">
        <ModuleBackButton @fromRoute={{@model.fromRoute}} />
      </div>
    </section>
  </main>
</template>
