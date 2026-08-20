import Input from 'pixeditor/components/field/input';
import Textarea from 'pixeditor/components/field/textarea';
<template>
  <form action class="form">
    {{#if @edition}}
      <Input @value={{@tube.name}} @edition={{@edition}} @change={{@setName}} @label="Nom" @id="tube-name" />
    {{/if}}
    <div class="segment segment--raised">
      <Input
        @value={{@tube.practicalTitleFr}}
        @change={{@setPracticalTitleFr}}
        @edition={{@edition}}
        @label="Titre pratique (fr)"
        @id="tube-title-fr"
      />
      <Textarea
        data-test-practical-description-fr-field
        @title="Description pratique (fr) :"
        @value={{@tube.practicalDescriptionFr}}
        @edition={{@edition}}
        @id="tube-description-fr"
      />
    </div>
    <div class="segment segment--raised">
      <Input
        @value={{@tube.practicalTitleEn}}
        @change={{@setPracticalTitleEn}}
        @edition={{@edition}}
        @label="Titre pratique (en)"
        @id="tube-title-en"
      />
      <Textarea
        data-test-practical-description-en-field
        @title="Description pratique (en) :"
        @value={{@tube.practicalDescriptionEn}}
        @edition={{@edition}}
        @id="tube-description-en"
      />
    </div>
    {{#unless @edition}}
      <Input @value={{@tube.pixId}} @label="Id" @edition={{false}} />
    {{/unless}}
  </form>
</template>
