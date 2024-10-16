import React, { useEffect, useState } from 'react';
import { chakra, HTMLChakraProps } from '@chakra-ui/react';
import { scaleLinear } from 'd3';

import { DAY_WIDTH, fadeInAnimation } from './utils';
import { TimelineDataSuccess } from './types';

interface DataPointsMasksProps {
  xScale: (date: Date) => number;
  yScale: (value: number) => number;
  data: TimelineDataSuccess[];
}

export function DataPointsMasks(props: DataPointsMasksProps) {
  const { xScale, yScale, data: values } = props;

  return (
    <>
      <mask id='data-rects'>
        {values.map(({ date, data }) => (
          <chakra.rect
            animation={fadeInAnimation}
            key={date.toISOString()}
            x={xScale(date) - DAY_WIDTH / 4}
            y={yScale(data.value) - 4}
            rx={4}
            width={`${DAY_WIDTH / 2}px`}
            height='8px'
            fill={data.valid_percent > 0 ? '#fff' : '#222'}
          />
        ))}
      </mask>
      <mask id='data-rects-bg'>
        {values.map(({ date, data }) => (
          <chakra.rect
            animation={fadeInAnimation}
            key={date.toISOString()}
            x={xScale(date) - DAY_WIDTH / 4}
            y={yScale(data.max)}
            rx={4}
            width={`${DAY_WIDTH / 2}px`}
            height={`${yScale(data.min) - yScale(data.max)}px`}
            fill='#fff'
          />
        ))}
      </mask>
    </>
  );
}

// Make start time global so every LoadingRect has the same baseline.
const starttime = Date.now();

export function LoadingRect(
  props: { yRange: number[]; delay: number } & HTMLChakraProps<'rect'>
) {
  const { yRange, delay, ...rest } = props;

  const [m, set] = useState(0);

  useEffect(() => {
    let rafId;
    const handler = (timestamp) => {
      const runtime = timestamp - starttime;
      const relativeProgress = runtime / 2000;
      set(Math.sin(relativeProgress * Math.PI + delay * 0.04));

      rafId = requestAnimationFrame(handler);
    };

    rafId = requestAnimationFrame(handler);

    return () => cancelAnimationFrame(rafId);
  }, [delay]);

  const posValue = scaleLinear().domain([-1, 1]).range(yRange);

  return (
    <chakra.rect
      animation={fadeInAnimation}
      rx={4}
      width={`${DAY_WIDTH / 2}px`}
      height='8px'
      {...rest}
      y={posValue(m)}
    />
  );
}
