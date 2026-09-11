import BrokenUrlList from 'pixeditor/components/broken-urls/list';
import BrokenUrlTabs from 'pixeditor/components/broken-urls/tabs';

<template>
  <BrokenUrlTabs />
  <BrokenUrlList @brokenUrls={{@model.tutorialBrokenUrls}} />
</template>
