import React, { useCallback, useEffect } from 'react';
import { Box, Divider, Flex, useDisclosure } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';

import Logo from './logo';
import SmartLink from './smart-link';
import AboutDrawer from './about-drawer';

interface PageHeaderProps {
  renderControls?: () => React.ReactNode;
  renderHeading?: () => React.ReactNode;
}

export default function PageHeader(props: PageHeaderProps) {
  const { renderControls, renderHeading } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchParams, setSearchParams] = useSearchParams();

  const onDrawerClose = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('about');
    setSearchParams(newParams);
    onClose();
  }, [searchParams, setSearchParams, onClose]);

  const onDrawerOpen = useCallback(
    (e) => {
      e.preventDefault();
      const newParams = new URLSearchParams(searchParams);
      newParams.set('about', '');
      setSearchParams(newParams);
      onOpen();
    },
    [searchParams, setSearchParams, onOpen]
  );

  useEffect(() => {
    if (searchParams.has('about')) {
      onOpen();
    }
  }, []);

  return (
    <Box as='header' zIndex={10} m={4} display='flex'>
      <Flex
        bg='surface.500'
        boxShadow='md'
        borderRadius='md'
        p={{ base: '2', md: '4' }}
        gap={4}
        alignItems='center'
      >
        <SmartLink
          to='?about'
          onClick={onDrawerOpen}
          _hover={{ textDecoration: 'none' }}
        >
          <Logo width='24px' height='24px' />
        </SmartLink>
        {renderHeading && (
          <>
            <Divider orientation='vertical' />
            {renderHeading()}
          </>
        )}
      </Flex>
      {renderControls && (
        <Flex
          bg='surface.500'
          boxShadow='md'
          borderRadius='md'
          p={{ base: '2', md: '4' }}
          gap={4}
          ml='auto'
          alignItems='center'
        >
          {renderControls()}
        </Flex>
      )}
      <AboutDrawer isOpen={isOpen} onClose={onDrawerClose} />
    </Box>
  );
}
