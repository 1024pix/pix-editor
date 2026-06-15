import ModuleBackButton from 'pixeditor/components/modules/module-back-button';
import ModuleForm from 'pixeditor/components/modules/module-form';
import ModuleNotification from 'pixeditor/components/modules/module-notification';

<template>
  <header class="page-header">
    <h1 class="page-title">Détail du module</h1>

  </header>
  <main class="page-body">
    <section class="page-section module-form">
      <ModuleNotification @module={{@model.module}} />
      <ModuleForm @module={{@model.module}} @readonly={{true}} />
      <div class="page-actions">
        <ModuleBackButton />
      </div>
    </section>
  </main>
</template>
