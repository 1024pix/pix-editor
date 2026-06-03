import ModuleForm from 'pixeditor/components/modules/module-form';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';

<template>
  <header class="page-header">
    <h1 class="page-title">Détail du draft de module</h1>
  </header>
  <main class="page-body">
    <section class="page-section module-form">
      <ModuleForm @module={{@model.draftModule}} @readonly={{true}} />
      <div class="page-actions">
        <PixButtonLink @route="authenticated.modules.workbench">Retour</PixButtonLink>
      </div>
    </section>
  </main>
</template>
