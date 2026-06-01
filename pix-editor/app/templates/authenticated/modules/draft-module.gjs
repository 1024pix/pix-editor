import ModuleForm from 'pixeditor/components/modules/module-form';

<template>
  <header class="page-header">
    <h1 class="page-title">Détail du draft de module {{@model.draftModule.internalTitle}}</h1>
  </header>
  <main class="page-body">
    <section class="page-section module-form">
      <ModuleForm @module={{@model.draftModule}} @readonly={{true}} />
    </section>
  </main>
</template>
