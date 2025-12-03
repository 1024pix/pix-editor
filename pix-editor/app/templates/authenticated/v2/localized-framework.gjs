import LocalizedFramework from 'pixeditor/components/v2/localized-framework';

<template>
  <LocalizedFramework
    @competence={{@controller.model.competence}}
    @localizedFrameworkTubes={{@controller.model.localizedFrameworkTubes}}
    @locale={{@controller.model.locale}}
  />
</template>
