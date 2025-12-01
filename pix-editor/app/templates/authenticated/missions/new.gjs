import Mission from 'pixeditor/components/form/mission';
<template>
  <header class="page-header">
    <h1 class="page-title">Création d'une mission</h1>
  </header>
  <main class="page-body">
    <section class="page-section">
      <Mission
        @mission={{@controller.model.mission}}
        @competences={{@controller.model.competences}}
        @onFormCancelled={{@controller.goBackToList}}
        @submitButtonText="Créer la mission"
        @onFormSubmitted={{@controller.createMission}}
      />
    </section>
  </main>
</template>
