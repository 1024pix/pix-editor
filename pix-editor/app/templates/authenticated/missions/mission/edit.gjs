import Mission from 'pixeditor/components/form/mission';
<template><header class="page-header">
  <h1 class="page-title">Modification d'une mission</h1>
</header>
<main class="page-body">
  <section class="page-section">
    <Mission @mission={{@controller.model.mission}} @competences={{@controller.model.competences}} @onFormCancelled={{@controller.goBackToMission}} @submitButtonText="Modifier la mission" @onFormSubmitted={{@controller.submitMission}} />
  </section>
</main>
</template>
