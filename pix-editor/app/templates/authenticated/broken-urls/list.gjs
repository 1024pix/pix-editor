import BrokenUrlTabs from 'pixeditor/components/broken-url-list';

<template>
  <header class="page-header">
    <BrokenUrlTabs @brokenUrls={{@model.brokenUrls}} />
  </header>
</template>
