import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { Jodit } from 'jodit/esm/index.js';

<template>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Modulix Editor</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css"
      integrity="sha512-q3eWabyZPc1XTCmF+8/LuE1ozpg5xxn7iO89yfSOd5/oKvyqLngoNGsx8jq92Y8eXJ/IRxQbEC+FGSYxtk2oiw=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/jodit@4.2.27/es2015/jodit.min.css"
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />

    <link rel="icon" type="image/png" href="favicon.png" />
  </head>
  <body>
    <main class="modulix-editor">
      <div class="modulix-editor__editor">
        <header class="d-flex flex-wrap gap-3">
          <h1 class="modulix-editor__title">
            <img
              src="/assets/images/modulix_editor.png"
              alt=""
              class="modulix-editor__logo"
            />
            Modulix Editor
          </h1>

          <div class="modulix-editor__buttons">
            <PixIconButton
              id="preview-button"
              @ariaLabel="Prévisualiser"
              @iconName="eye"
              data-tooltip="Prévisualiser"
            />
            <button
              class="btn btn-secondary"
              id="toggle-json-button"
              aria-label="Afficher le JSON"
              data-tooltip="Afficher le JSON"
            >
              <span class="fa fa-code"></span>
            </button>
            <button
              class="btn btn-secondary"
              id="download-json-button"
              aria-label="Télécharger le JSON"
              data-tooltip="Télécharger le JSON"
            >
              <span class="fa fa-download"></span>
            </button>
            <button
              class="btn btn-secondary"
              id="reset-button"
              aria-label="Réinitialiser"
              data-tooltip="Réinitialiser"
            >
              <span class="fa fa-trash"></span>
            </button>
            <button
              class="btn btn-secondary"
              id="format-button"
              aria-label="Nettoyer"
              data-tooltip="Nettoyer"
            >
              <span class="fa fa-broom"></span>
            </button>
            <button
              class="btn btn-secondary"
              id="collapse-all-button"
              aria-label="Tout replier"
              data-tooltip="Tout replier"
            >
              <span class="fa fa-compress"></span>
            </button>
          </div>
        </header>

        <div id="editor_holder"></div>
      </div>

      <div class="modulix-editor__render" id="json-output-pane">
        <textarea
          id="json_output"
          class="modulix-editor-render__input"
        ></textarea>
      </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/@json-editor/json-editor@2.15.2/dist/jsoneditor.min.js"></script>
    <script type="module">
      class LocalBackup {
        static localStorageKey = 'modulix-schema';

        static save(schema) {
          const schemaAsString = JSON.stringify(schema);
          window.localStorage.setItem(this.localStorageKey, schemaAsString);
        }

        static load() {
          const schemaAsString = window.localStorage.getItem(this.localStorageKey);
          try {
            return JSON.parse(schemaAsString);
          } catch {
            this.delete();
            return null;
          }
        }

        static delete() {
          window.localStorage.removeItem(this.localStorageKey);
        }
      }


      const schemaUrls = [
        'https://api.integration.pix.fr/api/module-schema/module-json-schema.json',
        'https://api.recette.pix.fr/api/module-schema/module-json-schema.json',
      ];

      let schema;
      while (!schema && schemaUrls.length > 0) {
        schema = await fetch(
          schemaUrls.shift(),
          { cache: 'no-cache' }, // misleading name, this will use the cache, but verify the ETag first (https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)
        )
          .then((res) => {
            if (!res.ok) {
              throw new Error(`invalid status code ${res.status}`);
            }
            return res.json();
          })
          .catch((err) => {
            console.error(
              'Error fetching JSON Schema from Pix API:',
              err.message,
            );
          });
      }

      if (schema) {
        init(schema);
      } else {
        window.alert('Erreur : Impossible de charger le schéma des modules');
      }

      function init(schema) {
        const element = document.getElementById('editor_holder');
        const jsonOutput = document.getElementById('json_output');

        Jodit.defaultOptions.toolbarAdaptive = false;
        Jodit.defaultOptions.buttons =
          'paragraph,|,bold,italic,strikethrough,link,eraser,|,ul,ol,|,hr,|,source';
        Jodit.defaultOptions.controls.paragraph.list = {
          p: 'Paragraph',
          h4: 'Heading 4',
          h5: 'Heading 5',
          blockquote: 'Quote',
          code: 'Source code',
        };
        Jodit.defaultOptions.controls.ul.list = null;
        Jodit.defaultOptions.controls.ol.list = null;
        Jodit.defaultOptions.enter = 'p';
        Jodit.defaultOptions.defaultMode = 3;
        Jodit.defaultOptions.useSplitMode = true;
        Jodit.defaultOptions.askBeforePasteHTML = false;

        schema.format = 'categories';

        // Force text element in top of list
        schema.properties.sections.items.properties.grains.items.properties.components.items.oneOf[0].properties.element.oneOf.sort(
          sortTextElementFirst,
        );
        schema.properties.sections.items.properties.grains.items.properties.components.items.oneOf[1].properties.steps.items.properties.elements.items.oneOf.sort(
          sortTextElementFirst,
        );

        schema.properties.sections.items.properties.grains.items.options = {
          collapsed: true,
        };
        schema.properties.sections.items.options = {
          collapsed: true,
        };

        schema.properties.shortId.default = generateId();
        schema.properties.shortId.readonly = true;

        schema.properties.visibility.default = 'public';
        schema.properties.visibility.readonly = true;

        const editor = new JSONEditor(element, {
          schema,
          iconlib: 'fontawesome5',
          no_additional_properties: false,
          disable_edit_json: true,
          disable_properties: true,
          disable_array_reorder: false,
          form_name_root: 'Module',
          show_errors: 'always',
        });

        const previewButton = document.querySelector('#preview-button');
        let previewWindow;
        previewButton.addEventListener('click', () => {
          const moduleContent = editor.getValue();
          const windowName = `modulix-preview-${moduleContent.id}`;
          previewWindow = window.open(
            'https://app.integration.pix.fr/modules/preview',
            windowName,
          );
        });

        window.addEventListener('message', (event) => {
          if (
            event.data?.from === 'pix-app' &&
            event.data?.message === 'Ready to receive content !'
          ) {
            const moduleContent = editor.getValue();
            sendDataForPreview(previewWindow, moduleContent);
          }
        });

        const jsonOutputPane = document.querySelector('#json-output-pane');
        const toggleCodeButton = document.querySelector('#toggle-json-button');
        let jsonOutputPaneDisplayed = false;
        toggleCodeButton.addEventListener('click', () => {
          jsonOutputPaneDisplayed = !jsonOutputPaneDisplayed;
          jsonOutputPane.style.display = jsonOutputPaneDisplayed
            ? 'block'
            : 'none';
        });

        const downloadButton = document.querySelector('#download-json-button');
        downloadButton.addEventListener('click', () => {
          const downloadLink = document.createElement('a');
          const json = editor.getValue();
          const jsonContent = JSON.stringify(json, null, 2);
          downloadLink.setAttribute(
            'href',
            'data:application/json;charset=utf-8,' +
              encodeURIComponent(jsonContent),
          );
          downloadLink.setAttribute('download', `${json.slug}.json`);

          downloadLink.style.display = 'none';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        });

        const resetButton = document.querySelector('#reset-button');
        resetButton.addEventListener('click', () => {
          if (
            window.confirm(
              'Voulez-vous vraiment réinitialiser le module ? Toutes les modifications seront perdues.',
            )
          ) {
            LocalBackup.delete();
            window.location.reload();
          }
        });

        const formatButton = document.getElementById('format-button');
        formatButton.addEventListener('click', () => {
          let jsonValue = JSON.stringify(editor.getValue());
          jsonValue = jsonValue.replaceAll(
            / (\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
            ' $1',
          );
          jsonValue = jsonValue.replaceAll(/ ([;?!])/g, ' $1');
          jsonValue = jsonValue.replaceAll(/(«) | ([»:])/g, '$1 $2');
          jsonValue = jsonValue.replaceAll(/<p><br><\/p>/g, '');
          jsonValue = jsonValue.replaceAll(/\\n/g, '');
          jsonValue = jsonValue.replaceAll(/'/g, '’');

          const output = JSON.parse(jsonValue);
          jsonOutput.value = JSON.stringify(output, null, 2);
          editor.setValue(output);
        });

        const collapseAllButton = document.getElementById(
          'collapse-all-button',
        );
        collapseAllButton.addEventListener('click', () => {
          const grainCollapseButtons = document.querySelectorAll(
            '#sections .card-title.level-5 button[title="Collapse"]',
          );
          const sectionCollapseButtons = document.querySelectorAll(
            '#sections .card-title.level-3 button[title="Collapse"]',
          );
          for (const button of [
            ...grainCollapseButtons,
            ...sectionCollapseButtons,
          ]) {
            button.click();
          }
        });

        editor.on('change', () => {
          if (JSON.stringify(editor.getValue(), null, 2) !== jsonOutput.value) {
            jsonOutput.value = JSON.stringify(editor.getValue(), null, 2);
          }

          displayJsonOutputError(jsonOutput);
          LocalBackup.save(editor.getValue());
          const moduleContent = editor.getValue();
          sendDataForPreview(previewWindow, moduleContent);
        });

        jsonOutput.addEventListener('focusout', () => {
          try {
            const value = JSON.parse(jsonOutput.value);
            editor.setValue(value);
          } catch (error) {
            console.error(error);
          }

          displayJsonOutputError(jsonOutput);
        });

        editor.on('ready', () => {
          const schema = LocalBackup.load();
          if (schema) {
            editor.setValue(schema);
          }
        });
      }

      function dec2hex(dec) {
        return dec.toString(16).padStart(2, '0');
      }

      function generateId() {
        const arr = new Uint8Array((8 || 40) / 2);
        window.crypto.getRandomValues(arr);
        return Array.from(arr, dec2hex).join('');
      }

      function displayJsonOutputError(jsonOutput) {
        try {
          JSON.parse(jsonOutput.value);
          jsonOutput.classList.remove(
            'modulix-editor-render__input--has-error',
          );
        } catch {
          jsonOutput.classList.add('modulix-editor-render__input--has-error');
        }
      }

      /**
       * Send module content to Pix App preview
       * @param moduleContent
       * @param previewWindow
       */
      function sendDataForPreview(previewWindow, moduleContent) {
        previewWindow?.postMessage(
          { from: 'modulix-editor', moduleContent },
          '*',
        );
      }

      function sortTextElementFirst(elementA, elementB) {
        if (elementA.title === 'text' && elementB.title !== 'text') {
          return -1;
        } else if (elementB.title === 'text' && elementA.title !== 'text') {
          return 1;
        }
        return 0; // keep the original order for other elements
      }
    </script>
  </body>
</html>

</template>
