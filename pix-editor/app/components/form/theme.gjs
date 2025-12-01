import Input from 'pixeditor/components/field/input';
<template>
  <form action class="ui form">
    <Input
      data-test-theme-name-field
      @value={{@theme.name}}
      @edition={{@edition}}
      @label="Nom fr-fr"
      @id="theme-name-fr"
    />
    <Input
      data-test-theme-name-en-us-field
      @value={{@theme.nameEnUs}}
      @edition={{@edition}}
      @label="Nom en-us"
      @id="theme-name-en"
    />
  </form>
</template>
