import React, { useCallback, useEffect, useState } from 'react';
import { useMap } from 'react-map-gl';
import { Divider, Flex, Heading, IconButton, Text } from '@chakra-ui/react';
import {
  CollecticonArrowDown,
  CollecticonArrowUp,
  CollecticonXmarkSmall
} from '@devseed-ui/collecticons-chakra';
import { format } from 'date-fns/format.js';

import { PopoverAnchored } from '../common/popover-anchored';

import { round } from '$utils/format';
import { useStableDisplayProps } from '$utils/usa-stable-display-props';

interface PointStatsPopoverProps {
  lngLat: [number, number] | null;
  /* eslint-disable-next-line react/no-unused-prop-types */
  data: any;
  onClose: () => void;
}

export function PointStatsPopover(props: PointStatsPopoverProps) {
  const { lngLat, onClose } = props;

  const mbMap = useMap().current;
  if (!mbMap) {
    throw new Error('Must be used inside the React Map GL context.');
  }

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  const update = useCallback(() => {
    if (!lngLat) {
      setIsVisible(false);
      return;
    }

    const { pageYOffset, pageXOffset } = window;
    const { width, height, top, left } = mbMap
      .getContainer()
      .getBoundingClientRect();

    const mapTop = pageYOffset + top;
    const mapLeft = pageXOffset + left;
    const mapRight = pageXOffset + left + width;
    const mapBottom = pageYOffset + top + height;

    const pos = mbMap.project(lngLat);

    const anchorPosition = {
      top: mapTop + pos.y,
      left: mapLeft + pos.x
    };

    if (
      // Top bound
      anchorPosition.top < mapTop ||
      // Bottom bound
      anchorPosition.top > mapBottom ||
      // Left bound
      anchorPosition.left < mapLeft ||
      // Right bound
      anchorPosition.left > mapRight
    ) {
      setIsVisible(false);
      return;
    }
    setIsVisible(true);
    setPosition([anchorPosition.left, anchorPosition.top]);
  }, [mbMap, lngLat]);

  // Setup listeners.
  useEffect(() => {
    // For situations where the body size changes.
    mbMap.on('move', update);
    const resizeObserver = new ResizeObserver(update);
    // Start observing
    resizeObserver.observe(document.body);

    return () => {
      mbMap.off('move', update);
      resizeObserver?.disconnect();
    };
  }, [mbMap, update]);

  // Update on mount.
  useEffect(() => {
    update();
    // Only do this on mount. The update is then called by the listener.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const displayProps = useStableDisplayProps({ props, unmounting: !lngLat });

  if (lngLat && !mbMap) {
    /* eslint-disable-next-line no-console */
    console.error('Mapbox map required for the popover. Use the mbMap prop.');
    return null;
  }

  const popoverData = displayProps.data.data;
  const hasData =
    displayProps.data.state === 'success' && popoverData.values[0] !== null;

  return (
    <PopoverAnchored
      refX={position[0]}
      refY={position[1]}
      isVisible={isVisible}
      offset={10}
      boxShadow='lg'
      p={4}
      display='flex'
      flexFlow='column'
      gap={4}
      borderRadius='md'
      transition='none'
    >
      <Flex gap={4}>
        <Heading size='xs'>
          {round(displayProps.lngLat?.[0] || 0, 4)},{' '}
          {round(displayProps.lngLat?.[1] || 0, 4)}
        </Heading>
        <IconButton
          aria-label='Close popover'
          icon={<CollecticonXmarkSmall />}
          size='xs'
          variant='ghost'
          colorScheme='base'
          ml='auto'
          onClick={onClose}
        />
      </Flex>
      {displayProps.data.state === 'loading' ? (
        <Text fontSize='sm'>Loading...</Text>
      ) : hasData ? (
        <>
          <Text fontSize='sm'>
            {round(popoverData.values[0], 3)} mg/m<sup>3</sup>
          </Text>
          {popoverData.previous?.value && (
            <StatFromLast
              value={popoverData.values[0]}
              previousValue={popoverData.previous.value}
              previousDate={popoverData.previous.date}
            />
          )}
        </>
      ) : (
        <Text fontSize='sm'>No data available for this point.</Text>
      )}
    </PopoverAnchored>
  );
}

function StatFromLast(props: {
  value: number;
  previousValue: number;
  previousDate: Date;
}) {
  const { value, previousValue, previousDate } = props;

  const change = value / previousValue;

  return (
    <>
      <Divider />
      <Flex gap={2} alignItems='center'>
        <Flex
          borderRadius='full'
          bgColor={change < 1 ? 'danger.500' : 'success.500'}
          color='surface.500'
          p={1}
          w={6}
          h={6}
        >
          {change < 1 ? <CollecticonArrowDown /> : <CollecticonArrowUp />}
        </Flex>
        <Text maxW={32}>
          <strong>{round(Math.abs(change - 1) * 100, 2)}%</strong>{' '}
          {change < 1 ? 'decrease' : 'increase'} since last measurement on{' '}
          <strong>{format(previousDate, 'MMM d, yyyy')}</strong>.
        </Text>
      </Flex>
    </>
  );
}
