import ArrayField from './fields/array-field';
import BooleanField from './fields/boolean-field';
import JoditField from './fields/jodit-field';
import NumberField from './fields/number-field';
import ObjectField from './fields/object-field';
import OneOfField from './fields/one-of-field';
import SelectField from './fields/select-field';
import StringField from './fields/string-field';
import UnknownField from './fields/unknown-field';

/**
 * Dispatcher central du SchemaForm.
 *
 * Lit le JSON schema et choisit le composant de champ approprié selon :
 *   - la présence de `oneOf` (union discriminée par `type`)
 *   - le `type` du schema (object, array, string, number, integer, boolean)
 *   - le `format` du schema (jodit → rich text)
 *   - la présence de `enum` (select)
 *
 * Un type non reconnu affiche UnknownField, qui préserve les données
 * sans les modifier (plus de perte silencieuse).
 */
const isOneOf = (schema) => schema?.oneOf?.length > 0;
const isObject = (schema) => schema?.type === 'object';
const isArray = (schema) => schema?.type === 'array';
const isBoolean = (schema) => schema?.type === 'boolean';
const isNumber = (schema) => schema?.type === 'number' || schema?.type === 'integer';
const isJodit = (schema) => schema?.type === 'string' && schema?.format === 'jodit';
const isSelect = (schema) => schema?.type === 'string' && schema?.enum?.length > 0;
const isString = (schema) => schema?.type === 'string';

<template>
  {{#if (isOneOf @schema)}}
    <OneOfField @schema={{@schema}} @value={{@value}} @onChange={{@onChange}} @label={{@label}} />
  {{else if (isObject @schema)}}
    <ObjectField @schema={{@schema}} @value={{@value}} @onChange={{@onChange}} @label={{@label}} />
  {{else if (isArray @schema)}}
    <ArrayField @schema={{@schema}} @value={{@value}} @onChange={{@onChange}} @label={{@label}} />
  {{else if (isBoolean @schema)}}
    <BooleanField @schema={{@schema}} @value={{@value}} @onChange={{@onChange}} @label={{@label}} />
  {{else if (isNumber @schema)}}
    <NumberField @schema={{@schema}} @value={{@value}} @onChange={{@onChange}} @label={{@label}} />
  {{else if (isJodit @schema)}}
    <JoditField @schema={{@schema}} @value={{@value}} @onChange={{@onChange}} @label={{@label}} />
  {{else if (isSelect @schema)}}
    <SelectField @schema={{@schema}} @value={{@value}} @onChange={{@onChange}} @label={{@label}} />
  {{else if (isString @schema)}}
    <StringField @schema={{@schema}} @value={{@value}} @onChange={{@onChange}} @label={{@label}} />
  {{else}}
    <UnknownField @schema={{@schema}} @value={{@value}} @label={{@label}} />
  {{/if}}
</template>
