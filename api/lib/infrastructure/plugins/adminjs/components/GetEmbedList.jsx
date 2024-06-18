import React, { useState } from 'react';
import axios from 'axios';
import { Icon, Text, Box } from '@adminjs/design-system';
import Loader from './Loader.jsx'
import Card from './Card.jsx';
import { useCurrentAdmin, useNotice } from 'adminjs';
import { saveAs } from 'file-saver';

const GetEmbedListComponent = () => {
  const [isFetching, setFetching] = useState(false);
  const sendNotice = useNotice();
  const [currentAdmin] = useCurrentAdmin();

  async function exportEmbedList() {
    setFetching(true);
    try {
      const token = currentAdmin?.email;
      const { data } = await axios.get('/api/embeds.csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      const blob = new Blob([data], { type: 'text/csv' });
      saveAs(blob, 'embeds-list.csv');
      sendNotice({ message: 'Exported successfully', type: 'success' });
    } catch (e) {
      sendNotice({ message: e.message, type: 'error' });
    } finally {
      setFetching(false);
    }
  }

  return (
    <Card as="button" style={{cursor: isFetching ? 'not-allowed' : 'pointer', width: '100%' }} onClick={exportEmbedList} disabled={isFetching}>
      <Text textAlign='center'>
        {isFetching ?
          <Loader style={{marginRight: 6}}/>
          :
        <Icon icon="Download" size={24} style={{ marginRight: 6 }} />
        }
        Exporter la liste des embeds utilisés
      </Text>
    </Card>
  )};

export default GetEmbedListComponent;
