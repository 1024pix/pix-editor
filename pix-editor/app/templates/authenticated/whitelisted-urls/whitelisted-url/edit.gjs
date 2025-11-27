import WhitelistedUrl from 'pixeditor/components/form/whitelisted-url';
<template><header class="page-header">
  <h1 class="page-title">Édition d'une URL à ne pas analyser dans les moulinettes</h1>
</header>
<main class="page-body">
  <section class="page-section">
    <WhitelistedUrl @initialUrl={{@controller.model.whitelistedUrl.url}} @initialComment={{@controller.model.whitelistedUrl.comment}} @initialRelatedSkillNames={{@controller.model.whitelistedUrl.relatedSkillNames}} @initialCheckType={{@controller.model.whitelistedUrl.checkType}} @cancelButtonText="Annuler" @onFormCancelled={{@controller.goBackToList}} @submitButtonText={{"Modifier"}} @onFormSubmitted={{@controller.editWhitelistedUrl}} />
  </section>
</main>
</template>
