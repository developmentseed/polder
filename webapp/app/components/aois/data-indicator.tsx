import React from 'react';
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Text,
  VisuallyHidden
} from '@chakra-ui/react';
import { CollecticonCircleInformation } from '@devseed-ui/collecticons-chakra';

import { IndicatorSettings } from './indicator-settings';

import SmartLink from '$components/common/smart-link';
import { round } from '$utils/format';

export interface IndicatorLegend {
  unit: string;
  stops: {
    color: string;
    value: number;
  }[];
}

interface DataIndicatorProps {
  isActive?: boolean;
  legend: IndicatorLegend;
  name: string;
  id: string;
  valueDomain: [number, number];
  rescaleValue: [number, number];
  colormapValue: string;
  onIndicatorSettingsChange: (what: string, payload: any) => void;
}

export function DataIndicator(props: DataIndicatorProps) {
  const {
    isActive,
    legend,
    name,
    id,
    valueDomain,
    rescaleValue,
    colormapValue,
    onIndicatorSettingsChange
  } = props;

  if (!isActive) {
    return (
      <SmartLink
        to={`?ind=${id}`}
        borderRadius='md'
        px={4}
        display='block'
        fontSize='sm'
        fontWeight='600'
        transition='background-color 0.32s'
        _hover={{
          bg: 'primary.100'
        }}
      >
        {name}
      </SmartLink>
    );
  }

  return (
    <Flex
      bg='primary.100'
      borderRadius='md'
      px={4}
      py={2}
      gap={2}
      flexFlow='column'
    >
      <Flex alignItems='center' gap={1}>
        <Flex
          gap={2}
          alignItems='center'
          fontSize='sm'
          fontWeight='600'
          mr='auto'
        >
          {name}{' '}
          <Badge textTransform='none' fontWeight='600' bgColor='primary.100a'>
            {legend.unit}
          </Badge>
        </Flex>
        <IndicatorSettings
          rescaleMin={valueDomain[0]}
          rescaleMax={valueDomain[1]}
          rescaleValue={rescaleValue}
          colormapValue={colormapValue}
          onChange={onIndicatorSettingsChange}
        />
        <Popover placement='top'>
          <PopoverTrigger>
            <IconButton
              aria-label='Information'
              size='xs'
              variant='ghost'
              icon={<CollecticonCircleInformation />}
            />
          </PopoverTrigger>
          <PopoverContent p={2} fontSize='sm'>
            <PopoverArrow />
            <p>Information about this indicator!</p>
          </PopoverContent>
        </Popover>
      </Flex>
      <Box>
        <Box
          aria-hidden
          height={2}
          width='100%'
          bg={`linear-gradient(to right, ${legend.stops.map((stop) => stop.color).join(', ')})`}
          borderRadius='full'
        />
        <Flex justifyContent='space-between' fontSize='xs'>
          <VisuallyHidden>From</VisuallyHidden>
          <Text as='span'>{round(legend.stops[0].value, 3)}</Text>
          <VisuallyHidden>to</VisuallyHidden>
          {/* {legend.stops.slice(1, -1).map((stop, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={index}>
              <Text as='span' aria-hidden>
                {stop.value}
              </Text>
              <VisuallyHidden>to</VisuallyHidden>
            </React.Fragment>
          ))} */}
          <Text as='span'>{round(legend.stops.last.value, 3)}</Text>
          <VisuallyHidden>{legend.unit}</VisuallyHidden>
        </Flex>
      </Box>
    </Flex>
  );
}
