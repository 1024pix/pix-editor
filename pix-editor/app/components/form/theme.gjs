import Input from 'pixeditor/components/field/input';
<template>
  <form action class="form">
    <Input @value={{@theme.name}} @edition={{@edition}} @change={{@setNameFr}} @label="Nom fr-fr" @id="theme-name-fr" />
    <Input
      @value={{@theme.nameEnUs}}
      @edition={{@edition}}
      @change={{@setNameEnUs}}
      @label="Nom en-us"
      @id="theme-name-en"
    />
  </form>
</template>
