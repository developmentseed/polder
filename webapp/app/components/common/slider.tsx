import React from 'react';
import {
  Box,
  Flex,
  useSlider,
  IconButton,
  useRangeSlider
} from '@chakra-ui/react';
import {
  CollecticonChevronLeftSmall,
  CollecticonChevronRightSmall
} from '@devseed-ui/collecticons-chakra';

import { DAY_WIDTH } from './timeline/utils';

export function Slider(props: {
  onChange: (value: number) => void;
  value: number;
  min?: number;
  max?: number;
}) {
  const { onChange, value, min = 0, max = 100 } = props;

  const { actions, getInputProps, getRootProps, getThumbProps, getTrackProps } =
    useSlider({ min, max, value, onChange });

  return (
    <Flex gap={2} alignItems='center'>
      <IconButton
        variant='ghost'
        size='sm'
        borderRadius='md'
        aria-label='Show preview dates'
        onClick={() => actions.stepTo(value - DAY_WIDTH)}
      >
        <CollecticonChevronLeftSmall />
      </IconButton>
      <Box cursor='pointer' minW={20} {...getRootProps()}>
        <input {...getInputProps()} hidden />
        <Box
          h={2}
          bgColor='base.200'
          borderRadius='full'
          {...getTrackProps()}
        />
        <Box
          top={0}
          boxSize={4}
          bgColor='primary.500'
          boxShadow='lg'
          borderRadius='full'
          _focusVisible={{
            outline: 'none'
          }}
          {...getThumbProps()}
        />
      </Box>
      <IconButton
        variant='ghost'
        size='sm'
        borderRadius='md'
        aria-label='Show next dates'
        onClick={() => actions.stepTo(value + DAY_WIDTH)}
      >
        <CollecticonChevronRightSmall />
      </IconButton>
    </Flex>
  );
}

export function RangeSlider(props: {
  onChange: (value: number[]) => void;
  value: number[];
  min?: number;
  max?: number;
}) {
  const { onChange, value, min = 0, max = 100 } = props;

  const {
    getInputProps,
    getRootProps,
    getThumbProps,
    getTrackProps,
    getInnerTrackProps
  } = useRangeSlider({ min, max, value, onChange });

  return (
    <Flex gap={2} alignItems='center'>
      <Box cursor='pointer' minW={20} {...getRootProps()}>
        <input {...getInputProps({ index: 0 })} hidden />
        <input {...getInputProps({ index: 1 })} hidden />
        <Box h={2} bgColor='base.200' borderRadius='full' {...getTrackProps()}>
          <Box
            h={2}
            bgColor='primary.300'
            borderRadius='full'
            {...getInnerTrackProps()}
          />
        </Box>
        <Box
          top={0}
          boxSize={4}
          bgColor='primary.500'
          boxShadow='lg'
          borderRadius='full'
          _focusVisible={{
            outline: 'none'
          }}
          {...getThumbProps({ index: 0 })}
        />
        <Box
          top={0}
          boxSize={4}
          bgColor='primary.500'
          boxShadow='lg'
          borderRadius='full'
          _focusVisible={{
            outline: 'none'
          }}
          {...getThumbProps({ index: 1 })}
        />
      </Box>
    </Flex>
  );
}
