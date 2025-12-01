import Production from 'pixeditor/components/statistics/production';
import I18n from 'pixeditor/components/statistics/i18n';
<template>
  <div class="main-left">
    <div class="main-title">
      <h1 class="ui header">Statistiques</h1>
    </div>
    <div class="ui fluid container statistics">
      <div class="ui two column padded grid">
        <div class="column">
          <Production @areas={{@controller.model}} @competenceCodes={{@controller.competenceCodes}} />
        </div>
        <div class="column">
          <I18n @areas={{@controller.model}} @competenceCodes={{@controller.competenceCodes}} />
        </div>
      </div>
    </div>
  </div>
</template>
