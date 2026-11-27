import Input from 'pixeditor/components/field/input';
<template>
  <form action class="ui form">
    <Input data-test-theme-name-field @value={{@theme.name}} @edition={{@edition}} @label="Nom" @id="theme-name-fr" />
  </form>
</template>
