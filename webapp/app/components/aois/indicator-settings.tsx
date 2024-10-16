import React, { useEffect, useMemo, useState } from 'react';
import {
  Flex,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Select,
  Text
} from '@chakra-ui/react';
import { CollecticonSlidersHorizontal } from '@devseed-ui/collecticons-chakra';
import debounce from 'lodash.debounce';

import { SettingsChangeCallback } from './settings';

import { validateRangeNum } from '$utils/utils';
import { StressedInput } from '$components/common/stressed-input';
import { colorInterpolators } from '$utils/colormaps';
import { RangeSlider } from '$components/common/slider';

interface IndicatorSettingsProps {
  rescaleMin: number;
  rescaleMax: number;
  onChange: SettingsChangeCallback;
  rescaleValue: [number, number];
  colormapValue: string;
}

export function IndicatorSettings(props: IndicatorSettingsProps) {
  const { rescaleMin, rescaleMax, rescaleValue, colormapValue, onChange } =
    props;

  const [internalRescale, setInternalRescale] = useState([
    rescaleMin,
    rescaleMax
  ]);
  const validateMin = validateRangeNum(rescaleMin, internalRescale[1]);
  const validateMax = validateRangeNum(internalRescale[0], rescaleMax);

  const [internalRescaleMin, internalRescaleMax] = internalRescale;

  const onChangeDebounced = useMemo<SettingsChangeCallback>(
    () => debounce(onChange, 300),
    [onChange]
  );

  const onRescaleChange = (value) => {
    setInternalRescale(value);
    onChangeDebounced('rescale', value);
  };

  useEffect(() => {
    // Set internal value after parent update.
    setInternalRescale(rescaleValue);
  }, [rescaleValue]);

  return (
    <Popover placement='top'>
      <PopoverTrigger>
        <IconButton
          aria-label='Indicator settings'
          size='xs'
          variant='ghost'
          icon={<CollecticonSlidersHorizontal />}
          ml='auto'
        />
      </PopoverTrigger>
      <PopoverContent p={4} fontSize='sm' maxW={60}>
        <PopoverArrow />
        <Flex gap={2} direction='column'>
          <Text as='p' textTransform='uppercase' color='base.400' fontSize='xs'>
            Settings
          </Text>
          <Flex gap={2} direction='column'>
            <Heading size='xs' as='p'>
              Rescale
            </Heading>
            <Flex gap={4}>
              <StressedInput
                size='xs'
                w={20}
                placeholder='150'
                value={internalRescaleMin.toString()}
                validate={validateMin}
                onChange={(v) => {
                  onRescaleChange([parseInt(v), internalRescaleMax]);
                }}
              />
              <RangeSlider
                value={internalRescale}
                min={rescaleMin}
                max={rescaleMax}
                onChange={onRescaleChange}
              />
              <StressedInput
                size='xs'
                w={20}
                placeholder='150'
                value={internalRescaleMax.toString()}
                validate={validateMax}
                onChange={(v) => {
                  onRescaleChange([internalRescaleMin, parseInt(v)]);
                }}
              />
            </Flex>
          </Flex>

          <Flex gap={2} direction='column'>
            <Heading size='xs' as='p'>
              Colormap
            </Heading>
            <Select
              size='xs'
              value={colormapValue}
              onChange={(e) => {
                onChange('colorScale', e.target.value);
              }}
            >
              {Object.keys(colorInterpolators).map((key) => (
                <option key={key} value={key}>
                  {key[0].toUpperCase() + key.slice(1)}
                </option>
              ))}
            </Select>
          </Flex>
        </Flex>
      </PopoverContent>
    </Popover>
  );
}
