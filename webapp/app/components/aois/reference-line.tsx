import React, { useEffect, useRef } from 'react';
import { chakra } from '@chakra-ui/react';
import { select, drag, ScaleLinear } from 'd3';

import { clamp, formatThousands } from '$utils/format';
import { DAY_WIDTH } from '$components/common/timeline/utils';

interface ReferenceLineProps {
  yScale: ScaleLinear<number, number, never>;
  dataArea: {
    x: number;
    y: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
  value: number;
  onChange: (value: number) => void;
}

export function ReferenceLine(props: ReferenceLineProps) {
  const { yScale, dataArea, value, onChange } = props;

  const dragHandleRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const element = dragHandleRef.current;
    if (!element) return;

    const d3drag = drag()
      .on('drag', (e) => {
        const newY = yScale.invert(e.y);
        const [min, max] = yScale.domain();
        onChange(clamp(newY, min, max));
      })
      .on('start', () => {
        document.body.style.cursor = 'ns-resize';
      })
      .on('end', () => {
        document.body.style.cursor = '';
      });

    d3drag(select(element));
  }, [yScale, onChange]);

  const yValue = yScale(value);

  return (
    <g>
      <chakra.line
        x1={dataArea.x - DAY_WIDTH / 2}
        x2={dataArea.x2 - DAY_WIDTH / 2}
        y1={yValue}
        y2={yValue}
        stroke='base.400'
        strokeWidth={2}
        strokeDasharray='4'
      />
      <chakra.g ref={dragHandleRef}>
        <g transform={`translate(${dataArea.x2 - DAY_WIDTH / 3},${yValue})`}>
          <chakra.rect
            y={-8}
            width='44px'
            height='16px'
            fill='base.400'
            rx={4}
            _hover={{
              cursor: 'ns-resize'
            }}
          />
          {/* Collecticon equal */}
          <g transform='translate(2,-8)'>
            <path d='M2,11h12V9H2V11z M2,5v2h12V5H2z' fill='white' />
          </g>
          <chakra.text
            x={20}
            y={-8}
            fontSize='0.75rem'
            fontWeight='bold'
            fill='surface.500'
            dy='1em'
            pointerEvents='none'
          >
            Ref
          </chakra.text>
        </g>
        <g transform={`translate(0,${yValue})`}>
          <chakra.rect
            y={-8}
            width='40px'
            height='16px'
            fill='base.100'
            rx={4}
            _hover={{
              cursor: 'ns-resize'
            }}
          />
          <chakra.text
            x={37}
            y={-7}
            fontSize='0.625rem'
            fontWeight='bold'
            fill='base.500'
            dy='1em'
            pointerEvents='none'
            textAnchor='end'
          >
            {formatThousands(value, { decimals: 2, forceDecimals: true })}
          </chakra.text>
        </g>
      </chakra.g>
    </g>
  );
}
