import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixLabel from '@1024pix/pix-ui/components/pix-label';
import MonacoEditor from 'pixeditor/components/monaco-editor/monaco-editor';

const monacoOptions = {
  ariaLabel: 'Contenu (JSON)',
  ariaRequired: true,
  height: 500,
  language: 'json',
  theme: 'vs-light',
};

<template>
  <div class="module-form">
    <PixInput @id="title" readonly>
      <:label>Titre</:label>
    </PixInput>

    <div class="module-form__data-field">
      <PixLabel @requiredLabel="Champ obligatoire">
        Contenu (JSON)
      </PixLabel>
      <MonacoEditor @options={{monacoOptions}} class="module-form__monaco-editor" />
    </div>
  </div>
</template>
