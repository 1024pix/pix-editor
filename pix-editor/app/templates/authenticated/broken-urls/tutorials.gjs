import BrokenUrlList from 'pixeditor/components/broken-url/list';
import BrokenUrlTabs from 'pixeditor/components/broken-url/tabs';

<template>
  <BrokenUrlTabs />
  <BrokenUrlList @brokenUrls={{@model.tutorialBrokenUrls}} />
</template>
