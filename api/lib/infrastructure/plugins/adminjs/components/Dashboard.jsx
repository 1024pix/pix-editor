import React from 'react';
import { Box, H1, Text, Icon } from '@adminjs/design-system';
import Card from './Card.jsx';
import GetEmbedList from './GetEmbedList.jsx';
import PeAdminSvg from './assets/pe-admin.svg.jsx';

const Dashboard = () => {
  return (
    <Box>
      <Box
        position="relative"
        overflow="hidden"
        bg="white"
        height={300}
        py={75}
        px={['default', 'lg', 250]}
      >
        <Box position="absolute" top={30} left={30}>
          <PeAdminSvg />
        </Box>
        <Text textAlign="center">
          <H1 style={{background: 'rgba(255,255,255,.3)', position: 'relative', zIndex: 2}}>Bienvenue dans la section d'administration de Pix Editor&nbsp;!</H1>
        </Text>
      </Box>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}}>
        <Box width={[1, 1 / 2, 1 / 2, 1 / 3]} p="lg">
          <Card as="a" href="/admin/resources/translations/actions/importExport">
            <Text textAlign="center">
              <Icon icon="ExternalLink" size={24} style={{ marginRight: 6 }} />
              Import/Export des traductions
            </Text>
          </Card>
        </Box>
        <Box width={[1, 1 / 2, 1 / 2, 1 / 3]} p="lg">
          <GetEmbedList />
        </Box>
      </div>
    </Box>
  );
}

export default Dashboard;
