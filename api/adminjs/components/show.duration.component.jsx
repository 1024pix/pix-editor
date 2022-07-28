import React from 'react'
import { Box, ValueGroup } from '@adminjs/design-system'
import { useInterval } from './use-interval';

const ShowInterval = (record) => {
  const params = record.record.params;
  const value = useInterval(params);

  return (
    <Box>
      <ValueGroup
        label="Duration"
        value={value}
      />
    </Box>
  )
}

export default ShowInterval;
