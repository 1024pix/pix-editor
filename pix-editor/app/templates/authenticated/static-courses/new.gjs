import StaticCourse from 'pix-editor/components/form/static-course';
<template>
  <header class="page-header">
    <h1 class="page-title">Création d'un test</h1>
  </header>
  <main class="page-body">
    <section class="page-section">
      <StaticCourse
        @initialName=""
        @initialDescription=""
        @initialChallengeIds=""
        @initialTagIds=""
        @cancelButtonText="Annuler"
        @onFormCancelled={{@controller.goBackToList}}
        @submitButtonText="Créer le test statique"
        @onFormSubmitted={{@controller.createStaticCourse}}
        @staticCourseTags={{@controller.model.staticCourseTags}}
      />
    </section>
  </main>
</template>
