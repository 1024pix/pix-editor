import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Loader, DropZone, H3 } from '@adminjs/design-system'
import { useCurrentAdmin, useNotice } from 'adminjs';
import { saveAs } from 'file-saver';

const ImportExportComponent = () => {
  const [isFetching, setFetching] = useState(false);
  const [file, setFile] = useState(null);
  const sendNotice = useNotice();
  const [currentAdmin] = useCurrentAdmin();

  async function exportTranslations() {
    setFetching(true);
    try {
      const token = currentAdmin?.email;
      const { data } = await axios.get('/api/translations.csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      const blob = new Blob([data], { type: 'text/csv' });
      saveAs(blob, 'export-translations.csv');
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
      await axios.post('/api/phrase/upload', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
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

      await axios.patch('/api/translations.csv',
        importData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
      });
      sendNotice({ message: 'Imported successfully', type: 'success' });
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
        <Button
          onClick={exportTranslations}
          variant="outlined"
          disabled={isFetching}
        >
          Exporter toutes les traductions dans un fichier CSV
        </Button>
        <br/>
        <Button
          mt={10}
          onClick={exportTranslationToPhrase}
          variant="outlined"
          disabled={isFetching}
        >
          Exporter toutes les traductions dans phrase
        </Button>
      </Box>
      <Box>
        <H3>Import</H3>
        <DropZone
          mimeTypes={['text/csv']}
          onChange={(files) => setFile(files?.[0] ?? null)}
        />
        <Button
          onClick={importTranslations}
          variant="outlined"
          disabled={isFetching || !file}
          mt={24}
        >
          Importer les traductions
        </Button>
      </Box>
    </Box>
  );
};

export default ImportExportComponent;
