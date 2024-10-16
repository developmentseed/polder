import React from 'react';
import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

export default function PageLayout() {
  return (
    <Flex direction='column' minHeight='100vh' bg='base.50' overflowX='hidden'>
      <Outlet />
    </Flex>
  );
}
