import BrokenUrlFilters from 'pixeditor/components/broken-urls/filters';
import BrokenUrlList from 'pixeditor/components/broken-urls/list';
import BrokenUrlTabs from 'pixeditor/components/broken-urls/tabs';
import DeleteTutorialPopIn from 'pixeditor/components/pop-in/delete-tutorial';

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
    @tutorialFilterValues={{@controller.tutorials}}
    @showTutorialsFilters={{true}}
    @frameworkFilterValues={{@controller.frameworks}}
  />
  <BrokenUrlList
    @brokenUrls={{@controller.filteredBrokenUrls}}
    @showTutorialsColumns={{true}}
    @onDeleteTutorial={{@controller.showDeleteTutorialPopIn}}
  />
  {{#if @controller.tutorialToDelete}}
    <DeleteTutorialPopIn
      @tutorial={{@controller.tutorialToDelete}}
      @skillsUsingTutorial={{@controller.skillsUsingTutorialToDelete}}
      @onDeleteTutorial={{@controller.onConfirmDeleteTutorial}}
      @onClose={{@controller.clearTutorialToDelete}}
    />
  {{/if}}
</template>
