import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Loader } from '@adminjs/design-system'
import { useCurrentAdmin, useNotice } from 'adminjs';
import { saveAs } from 'file-saver';

const ExportComponent = () => {
  const [isFetching, setFetching] = useState();
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
    }
    setFetching(false);
  }

  if (isFetching) {
    return <Loader />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="left">
        <Box key="csv" m={2}>
          <Button
            onClick={exportTranslations}
            variant="outlined"
            disabled={isFetching}
          >
            Exporter toutes les traductions dans un fichier CSV
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ExportComponent;
