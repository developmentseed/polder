import React from 'react';
import { chakra, ChakraProps, Flex, Text, useToken } from '@chakra-ui/react';

export default function Logo(props: ChakraProps) {
  const [colorPrimary] = useToken('colors', ['primary.500']);

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
        <circle cx='64' cy='64' r='64' fill={colorPrimary} />
      </chakra.svg>
      <Text fontWeight='800' color='base.500'>
        Poldre
      </Text>
    </Flex>
  );
}
