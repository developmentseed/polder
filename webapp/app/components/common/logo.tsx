import React from 'react';
import { chakra, ChakraProps, Flex, Text } from '@chakra-ui/react';

export default function Logo(props: ChakraProps) {
  return (
    <Flex gap={2} alignItems='center'>
      <chakra.svg
        width='32px'
        height='32px'
        viewBox='0 0 128 128'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        {...props}
      >
        <path d='M0 8C0 3.58172 3.58172 0 8 0H56V40H0V8Z' fill='#539772' />
        <path
          d='M0 48H56V128H32C14.3269 128 0 113.673 0 96V48Z'
          fill='#6C7F2A'
        />
        <path
          d='M64 0H96C113.673 0 128 14.3269 128 32V76H64V0Z'
          fill='#3AAFB9'
        />
      </chakra.svg>
      <Text fontWeight='800' color='base.500'>
        Polder
      </Text>
    </Flex>
  );
}
