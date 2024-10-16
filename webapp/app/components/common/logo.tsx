import React from 'react';
import { chakra, ChakraProps, useToken } from '@chakra-ui/react';

export default function Logo(props: ChakraProps) {
  const [colorPrimary] = useToken('colors', ['primary.500']);

  return (
    <chakra.svg
      width='16'
      height='16'
      viewBox='0 0 128 128'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <circle cx='64' cy='64' r='64' fill={colorPrimary} />
    </chakra.svg>
  );
}
