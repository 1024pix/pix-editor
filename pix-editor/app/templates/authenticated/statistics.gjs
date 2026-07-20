import I18n from 'pixeditor/components/statistics/i18n';
import Production from 'pixeditor/components/statistics/production';
<template>
  <div class="main-left">
    <div class="statistics__container">
      <div class="statistics__title">
        <h1 class="statistics__heading">Statistiques</h1>
      </div>
      <div class="statistics__grid-wrapper">
        <div class="statistics__grid">
          <div class="statistics__column">
            <Production @areas={{@controller.model}} @competenceCodes={{@controller.competenceCodes}} />
          </div>
          <div class="statistics__column">
            <I18n @areas={{@controller.model}} @competenceCodes={{@controller.competenceCodes}} />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
