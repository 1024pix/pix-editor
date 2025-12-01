import Input from 'pixeditor/components/field/input';
import Textarea from 'pixeditor/components/field/textarea';
<template>
  <form action class="ui form">
    {{#if @edition}}
      <Input data-test-name-field @value={{@tube.name}} @edition={{@edition}} @label="Nom" @id="tube-name" />
    {{/if}}
    <div class="ui raised segment">
      <Input
        data-test-practical-title-fr-field
        @value={{@tube.practicalTitleFr}}
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
    <div class="ui raised segment">
      <Input
        data-test-practical-title-en-field
        @value={{@tube.practicalTitleEn}}
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
      <Input data-test-pix-id-field @value={{@tube.pixId}} @title="Id" @edition={{false}} />
    {{/unless}}
  </form>
</template>
