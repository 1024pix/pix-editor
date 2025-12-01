import CompetenceOverview from 'pixeditor/components/competence-overview/competence-overview';
<template>
  <CompetenceOverview
    @competenceOverview={{@controller.model.competenceOverview}}
    @locale={{@controller.model.locale}}
  />
  {{outlet}}
</template>
