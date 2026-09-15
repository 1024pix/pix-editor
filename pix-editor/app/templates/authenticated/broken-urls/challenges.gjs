import BrokenUrlList from 'pixeditor/components/broken-urls/list';
import BrokenUrlTabs from 'pixeditor/components/broken-urls/tabs';

<template>
  <BrokenUrlTabs />
  <BrokenUrlList
    @brokenUrls={{@model.challengeBrokenUrls}}
    @urlFilterValue={{@controller.url}}
    @statusCodeList={{@controller.statusCodeList}}
    @statusCodeFilterValue={{@controller.statusCode}}
    @skillFilterValues={{@controller.skills}}
    @localizedChallengeFilterValues={{@controller.localizedChallenges}}
    @onApplyFiltersClicked={{@controller.applyFilters}}
    @onClearFiltersClicked={{@controller.clearFilters}}
  />
</template>
