import StaticCourse from 'pix-editor/components/form/static-course';
<template>
  <header class="page-header">
    <h1 class="page-title">Édition du test statique</h1>
  </header>
  <main class="page-body">
    <section class="page-section">
      <StaticCourse
        @initialName={{@controller.model.staticCourse.name}}
        @initialDescription={{@controller.model.staticCourse.description}}
        @initialChallengeIds={{@controller.challengeIdsAsStringWithBreakLines}}
        @initialTagIds={{@controller.tagIds}}
        @cancelButtonText="Annuler"
        @onFormCancelled={{@controller.goBackToDetails}}
        @submitButtonText="Enregistrer"
        @onFormSubmitted={{@controller.editStaticCourse}}
        @staticCourseTags={{@controller.model.staticCourseTags}}
      />
    </section>
  </main>
</template>
