import PlayModuleButton from './play-module-button';

<template>
  <PlayModuleButton @module={{@module}} @isPreview={{false}} />
  <PlayModuleButton @module={{@module}} @isPreview={{true}} />
</template>
