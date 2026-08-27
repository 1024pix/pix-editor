import BrokenUrlList from 'pixeditor/components/broken-url-list';

<template>
  <header class="page-header">
    <BrokenUrlList @brokenUrls={{@model.brokenUrls}} />
  </header>
</template>
