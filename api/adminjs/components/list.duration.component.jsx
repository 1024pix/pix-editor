import React from 'react'
import { Box } from '@adminjs/design-system'
import { useInterval } from './use-interval';

const ShowInterval = (record) => {
  const params = record.record.params;
  const value = useInterval(params);

  return (
    <Box>
      {value}
    </Box>
  )
}

export default ShowInterval;
