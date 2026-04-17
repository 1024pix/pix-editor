import CompetenceHeader from 'pixeditor/components/v2/competence-header';
<template>
  <CompetenceHeader @competence={{@controller.model.competence}} @locale={{@controller.model.locale}} />
  {{outlet}}
</template>
