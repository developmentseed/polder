import { Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { useRouteError } from 'react-router-dom';

import Logo from './common/logo';
import SmartLink from './common/smart-link';

export function ErrorBoundary() {
  const error: any = useRouteError();

  return (
    <Flex h='100vh' justifyContent='center' alignItems='center'>
      <Flex flexFlow='column' gap={4} w='container.md' alignItems='center'>
        <Logo width={20} height='22px' />
        <Heading>
          {error?.status === 404
            ? '404 - Not found'
            : 'Unexpected Application Error'}
        </Heading>
        {error?.status === 404 ? (
          <Text align='center'>
            You are looking for something that does not exist. <br />
            Go to the <SmartLink to='/'>home page</SmartLink> to find your
            bearings again.
          </Text>
        ) : (
          <Text align='center'>
            Something went wrong and it is not your fault. <br />
            Try to{' '}
            <SmartLink to={window.location.toString()}>
              reload the page
            </SmartLink>{' '}
            or go back to the <SmartLink to='/'>home page</SmartLink> to find
            your bearings again.
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
