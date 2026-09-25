import BrokenUrlFilters from 'pixeditor/components/broken-urls/filters';
import BrokenUrlList from 'pixeditor/components/broken-urls/list';
import BrokenUrlTabs from 'pixeditor/components/broken-urls/tabs';

<template>
  <BrokenUrlTabs />
  <BrokenUrlFilters
    @brokenUrls={{@model.brokenUrls}}
    @onApplyFiltersClicked={{@controller.applyFilters}}
    @onClearFiltersClicked={{@controller.clearFilters}}
    @urlFilterValue={{@controller.url}}
    @statusCodeFilterValue={{@controller.statusCode}}
    @skillFilterValues={{@controller.skills}}
    @localizedChallengeFilterValues={{@controller.localizedChallenges}}
    @showChallengesFilters={{true}}
    @frameworkFilterValues={{@controller.frameworks}}
  />
  <BrokenUrlList
    @brokenUrls={{@controller.filteredBrokenUrls}}
    @showChallengesColumns={{true}}
    @onIgnoreUrl={{@controller.onIgnoreUrl}}
  />
</template>
