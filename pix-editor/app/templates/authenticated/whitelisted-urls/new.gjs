import WhitelistedUrl from 'pixeditor/components/form/whitelisted-url';
<template><header class="page-header">
  <h1 class="page-title">Ajout d'une URL à ne pas analyser dans les moulinettes</h1>
</header>
<main class="page-body">
  <section class="page-section">
    <WhitelistedUrl @initialUrl="" @initialComment="" @initialRelatedSkillNames="" @initialCheckType="" @cancelButtonText="Annuler" @onFormCancelled={{@controller.goBackToList}} @submitButtonText={{"Ajouter"}} @onFormSubmitted={{@controller.createWhitelistedUrl}} />
  </section>
</main></template>
