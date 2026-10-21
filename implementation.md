# PoC — Remplacement de json-editor par SchemaForm

## Problème résolu

`json-editor` écrase silencieusement les types inconnus dans les `oneOf` (ex. un élément `stepper` devient `text` sans avertissement). Il est aussi opaque, peu configurable, et incompatible avec Ember.

## Ce qui a été créé

### Route PoC
- `app/routes/authenticated/poc-modulix-editor.js` — charge le JSON schema depuis `/api/module-schema/module-json-schema.json`
- `app/templates/authenticated/poc-modulix-editor.gjs` — page deux colonnes : formulaire à gauche, Monaco Editor à droite

### Composant SchemaForm
Renderer récursif piloté par le JSON schema exposé par l'API. Le schema évolue côté API, le formulaire suit automatiquement.

**`schema-form/field.gjs`** — dispatcher central (template-only component). Lit le schema et choisit le bon composant selon `type` et `format` :

| Condition schema | Composant rendu |
|---|---|
| `oneOf` présent | `OneOfField` |
| `type: object` | `ObjectField` |
| `type: array` | `ArrayField` |
| `type: boolean` | `BooleanField` |
| `type: number / integer` | `NumberField` |
| `type: string, format: jodit` | `JoditField` |
| `type: string` + `enum` | `SelectField` |
| `type: string` | `StringField` |
| Aucun type reconnu | `UnknownField` |

**Champs notables :**
- `OneOfField` — gère les unions discriminées par `value.type`. Si le type est absent du schema, affiche `UnknownField` qui **préserve les données sans les modifier** (correction principale vs json-editor).
- `ObjectField` — itère sur `properties`, gère le pattern `if/then` pour les propriétés conditionnelles.
- `ArrayField` — liste avec ajout/suppression, construit la valeur par défaut via `build-default-value.js`.
- `SelectField` — les options sélectionnées sont calculées dans un getter JS (`selectOptions`), sans helper dans le template (contrainte Glimmer strict mode).

### Panneau JSON (Monaco Editor)
Le panneau droit réutilise le composant `MonacoEditor` existant avec `language: 'json'`. Il reçoit `@onChange` qui parse le JSON et met à jour l'état réactif partagé avec le formulaire.

## Architecture des données

```
moduleValue (objet JS @tracked)
    ↕                    ↕
SchemaForm          MonacoEditor
(lecture + écriture via @onChange)
```

L'état réactif est la source de vérité unique. Plus de perte silencieuse : si un type est inconnu, il reste dans l'état et `UnknownField` l'affiche avec un avertissement.

## Points techniques notables

- **Glimmer strict mode (GJS)** : les helpers d'`ember-truth-helpers` (`eq`, etc.) ne fonctionnent pas en position d'attribut HTML (`selected={{eq a b}}`). Il faut calculer la valeur dans un getter JS et passer un booléen simple au template.
- **Dépendances circulaires** : `field.gjs` importe `ObjectField`, `ArrayField`, `OneOfField` qui importent à leur tour `field.gjs`. Résolu en passant `field.gjs` en template-only component avec dispatch par `{{#if}}` explicites.
- **Textarea en GJS** : `<textarea>{{value}}</textarea>` ne fonctionne pas en Glimmer. L'interpolation entre balises est ignorée. Il faut `<Textarea @value=...>` (Ember component) ou un modifier.
