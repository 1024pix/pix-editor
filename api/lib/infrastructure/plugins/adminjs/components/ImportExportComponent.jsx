import React, { useState } from 'react';
import { Box, Button, Loader, DropZone, H3 } from '@adminjs/design-system';
import { useCurrentAdmin, useNotice } from 'adminjs';
import { saveAs } from 'file-saver';

const ImportExportComponent = () => {
  const [isFetching, setFetching] = useState(false);
  const [file, setFile] = useState(null);
  const sendNotice = useNotice();
  const [currentAdmin] = useCurrentAdmin();

  async function exportTranslations(frameworkName) {
    setFetching(true);
    try {
      const token = currentAdmin?.email;
      const response = await fetch(`/api/translations.csv?frameworkName=${frameworkName}`, {
        headers: {
          ['x-api-key']: token,
        },
      });
      const data = await response.text();
      const blob = new Blob([data], { type: 'text/csv' });
      saveAs(blob, 'export-translations.csv');
      sendNotice({ message: 'Exported successfully', type: 'success' });
    } catch (e) {
      sendNotice({ message: e.message, type: 'error' });
    } finally {
      setFetching(false);
    }
  }

  async function exportAllWeblateTranslations() {
    setFetching(true);
    try {
      const token = currentAdmin?.email;
      const response = await fetch(`/api/weblate-translations.zip`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = await response.blob();
      saveAs(blob, 'weblate-translations.zip');
      sendNotice({ message: 'Exported successfully', type: 'success' });
    } catch (e) {
      sendNotice({ message: e.message, type: 'error' });
    } finally {
      setFetching(false);
    }
  }

  async function exportTranslationToPhrase() {
    setFetching(true);
    try {
      const token = currentAdmin?.email;
      await fetch('/api/phrase/upload', {
        method: 'POST',
        body: {},
        headers: {
          ['x-api-key']: token,
        },
      });
      sendNotice({ message: 'Upload request in progress', type: 'success' });
    } catch (e) {
      sendNotice({ message: e.message, type: 'error' });
    } finally {
      setFetching(false);
    }
  }

  async function importTranslations() {
    setFetching(true);
    try {
      const token = currentAdmin?.email;
      const importData = new FormData();
      importData.append('file', file, file?.name);

      await fetch('/api/translations.csv', {
        method: 'PATCH',
        body: importData,
        headers: {
          ['x-api-key']: token,
        },
      });
      sendNotice({ message: 'Imported successfully', type: 'success' });
    } catch (e) {
      sendNotice({ message: e.message, type: 'error' });
    } finally {
      setFetching(false);
    }
  }

  async function importTranslationFromPhrase() {
    setFetching(true);
    try {
      const token = currentAdmin?.email;
      await fetch('/api/phrase/download', {
        method: 'POST',
        body: {},
        headers: {
          ['x-api-key']: token,
        },
      });
      sendNotice({ message: 'Download request in progress', type: 'success' });
    } catch (e) {
      sendNotice({ message: e.message, type: 'error' });
    } finally {
      setFetching(false);
    }
  }

  if (isFetching) {
    return <Loader />;
  }

  return (
    <Box>
      <Box mb={30}>
        <H3>Export</H3>
        <Button onClick={() => exportTranslations('Pix')} variant="outlined" disabled={isFetching}>
          Exporter les traductions FR du référentiel Pix dans un fichier CSV
        </Button>
        <br />
        <Button
          mt={10}
          onClick={() => exportTranslations('Numérique Responsable')}
          variant="outlined"
          disabled={isFetching}
        >
          Exporter les traductions FR du référentiel Numérique Responsable dans un fichier CSV
        </Button>
        <br />
        <Button mt={10} onClick={exportTranslationToPhrase} variant="outlined" disabled={isFetching}>
          Exporter toutes les traductions FR dans Phrase
        </Button>
        <br />
        <Button mt={10} onClick={() => exportAllWeblateTranslations()} variant="outlined" disabled={isFetching}>
          Exporter toutes les traductions pour Weblate
        </Button>
        <br />
      </Box>
      <Box>
        <H3>Import</H3>
        <DropZone mimeTypes={['text/csv']} onChange={(files) => setFile(files?.[0] ?? null)} />
        <Button onClick={importTranslations} variant="outlined" disabled={isFetching || !file} mt={24}>
          Importer les traductions
        </Button>
        <br />
        <Button mt={10} onClick={importTranslationFromPhrase} variant="outlined" disabled={isFetching}>
          Importer les traductions depuis Phrase
        </Button>
      </Box>
    </Box>
  );
};

export default ImportExportComponent;
