import LocalizedFramework from 'pix-editor/components/v2/localized-framework';

<template>
  <LocalizedFramework
    @competence={{@controller.model.competence}}
    @localizedFrameworkTubes={{@controller.model.localizedFrameworkTubes}}
    @locale={{@controller.model.locale}}
  />
</template>
