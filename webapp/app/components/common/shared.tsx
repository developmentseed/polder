import React from 'react';
import { Box, BoxProps, forwardRef } from '@chakra-ui/react';

export const FloatBox = forwardRef<BoxProps, 'div'>((props, ref) => (
  <Box
    ref={ref}
    bg='surface.500'
    borderRadius='md'
    boxShadow='lg'
    p={4}
    {...props}
  />
));
