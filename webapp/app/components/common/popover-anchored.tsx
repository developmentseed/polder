import React, { useEffect, useRef } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

import {
  arrow,
  flip,
  offset,
  useFloating,
  useTransitionStyles
} from '@floating-ui/react';

interface PopoverProps extends BoxProps {
  refX: number;
  refY: number;
  isVisible: boolean;
  offset?: number;
}

export function PopoverAnchored(props: PopoverProps) {
  const {
    refX,
    refY,
    isVisible,
    children,
    bg,
    offset: extraOffset = 0,
    ...rest
  } = props;

  const arrowRef = useRef<HTMLDivElement>(null);
  const arrowLen = 10;
  // Get half the arrow box's hypotenuse length
  const floatingOffset = Math.sqrt(2 * arrowLen ** 2) / 2 + extraOffset;

  const { refs, floatingStyles, middlewareData, placement, context } =
    useFloating({
      open: isVisible,
      placement: 'right',
      middleware: [
        flip(),
        offset(floatingOffset),
        arrow({
          element: arrowRef
        })
      ]
    });

  const { isMounted, styles } = useTransitionStyles(context);

  useEffect(() => {
    refs.setPositionReference({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: refX,
        y: refY,
        top: refY,
        left: refX,
        right: refX,
        bottom: refY
      })
    });
  }, [refs, refX, refY]);

  const side = placement.split('-')[0];

  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
  }[side]!;

  const positionProps = {
    left: middlewareData.arrow ? `${middlewareData.arrow.x}px` : '',
    top: middlewareData.arrow ? `${middlewareData.arrow.y}px` : '',
    [staticSide]: `${-arrowLen / 2}px`
  };

  return isMounted ? (
    <Box
      ref={refs.setFloating}
      style={floatingStyles}
      transition='transform 0.16s ease-in-out'
      bg={bg || 'surface.500'}
      {...rest}
      sx={styles}
    >
      {children}
      <Box
        ref={arrowRef}
        bg={bg || 'surface.500'}
        boxSize={`${arrowLen}px`}
        pos='absolute'
        transform='rotate(45deg)'
        zIndex={-1}
        pointerEvents='none'
        {...positionProps}
      />
    </Box>
  ) : null;
}
